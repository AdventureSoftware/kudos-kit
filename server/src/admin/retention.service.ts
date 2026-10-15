import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaAdminService } from '../prisma/prisma-admin.service';

const DAY_MS = 24 * 60 * 60 * 1000;

const INVITATION_GRACE_DAYS = 30;

const FIRST_RUN_MS = 60 * 1000;

export interface RetentionResult {
  feedback: number;
  /** Testimonials kept past the retention period whose technical details were removed. */
  testimonialsTrimmed: number;
  sessions: number;
  invitations: number;
}

@Injectable()
export class RetentionService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger('Retention');
  private timers: NodeJS.Timeout[] = [];

  constructor(
    private readonly prisma: PrismaAdminService,
    private readonly config: ConfigService,
  ) {}

  get feedbackDays(): number {
    return this.config.get<number>('retention.feedbackDays') ?? 90;
  }

  onApplicationBootstrap(): void {
    if (process.env.NODE_ENV === 'test') return;
    const run = () => void this.purge().catch((err) => this.logger.error(`Clean-up failed: ${String(err)}`));
    const first = setTimeout(() => {
      run();
      const daily = setInterval(run, DAY_MS);
      daily.unref();
      this.timers.push(daily);
    }, FIRST_RUN_MS);
    first.unref(); // never keeps the process alive on shutdown
    this.timers.push(first);
  }

  onModuleDestroy(): void {
    this.timers.forEach(clearTimeout);
  }

  async purge(now = new Date()): Promise<RetentionResult> {
    const days = this.feedbackDays;
    const cutoff = new Date(now.getTime() - days * DAY_MS);
    const [feedback, testimonialsTrimmed, sessions, invitations] = await Promise.all([
      // Testimonials (praise with consent) are kept; everything else older than the cutoff goes.
      days > 0
        ? this.prisma.feedback.deleteMany({ where: { created_at: { lt: cutoff }, testimonial_ok: false } })
        : Promise.resolve({ count: 0 }),
      // Kept testimonials lose the technical details they no longer need.
      days > 0 ? this.trimTestimonials(cutoff) : Promise.resolve(0),
      this.prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
      this.prisma.invitation.deleteMany({ where: { expiresAt: { lt: new Date(now.getTime() - INVITATION_GRACE_DAYS * DAY_MS) } } }),
    ]);
    const result = {
      feedback: feedback.count,
      testimonialsTrimmed,
      sessions: sessions.count,
      invitations: invitations.count,
    };
    if (result.feedback || result.testimonialsTrimmed || result.sessions || result.invitations) {
      this.logger.log(
        `Deleted ${result.feedback} old feedback, ${result.sessions} expired logins, ${result.invitations} old invitations; ` +
          `removed technical details from ${result.testimonialsTrimmed} kept testimonials.`,
      );
    }
    return result;
  }

  /** Raw SQL because Prisma can't write the inet column. */
  private trimTestimonials(cutoff: Date): Promise<number> {
    return this.prisma.$executeRaw`
      UPDATE feedback
      SET ip = NULL, context = NULL, console_logs = NULL, errors = NULL
      WHERE testimonial_ok
        AND created_at < ${cutoff}
        AND (ip IS NOT NULL OR context IS NOT NULL OR console_logs IS NOT NULL OR errors IS NOT NULL)`;
  }
}
