import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaAdminService } from '../prisma/prisma-admin.service';

const DAY_MS = 24 * 60 * 60 * 1000;

const INVITATION_GRACE_DAYS = 30;

const FIRST_RUN_MS = 60 * 1000;

export interface RetentionResult {
  feedback: number;
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
    const [feedback, sessions, invitations] = await Promise.all([
      days > 0
        ? this.prisma.feedback.deleteMany({ where: { created_at: { lt: new Date(now.getTime() - days * DAY_MS) } } })
        : Promise.resolve({ count: 0 }),
      this.prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
      this.prisma.invitation.deleteMany({ where: { expiresAt: { lt: new Date(now.getTime() - INVITATION_GRACE_DAYS * DAY_MS) } } }),
    ]);
    const result = { feedback: feedback.count, sessions: sessions.count, invitations: invitations.count };
    if (result.feedback || result.sessions || result.invitations) {
      this.logger.log(`Deleted ${result.feedback} old feedback, ${result.sessions} expired logins, ${result.invitations} old invitations.`);
    }
    return result;
  }
}
