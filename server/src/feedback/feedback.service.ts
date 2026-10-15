import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaIngestService } from '../prisma/prisma-ingest.service';
import { TurnstileService } from './turnstile.service';
import { NotificationService } from './notification.service';
import { CreateFeedbackDto, FeedbackType } from './dto/create-feedback.dto';

export function testimonialConsent(dto: Pick<CreateFeedbackDto, 'type' | 'testimonialOk' | 'testimonialName'>) {
  const ok = dto.type === FeedbackType.PRAISE && dto.testimonialOk === true;
  const name = ok ? (dto.testimonialName ?? '').replace(/\s+/g, ' ').trim() || null : null;
  return { ok, name };
}

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaIngestService,
    private turnstile: TurnstileService,
    private notification: NotificationService,
  ) {}

  async submit(dto: CreateFeedbackDto, ip: string): Promise<void> {
    if (dto.hp) return;

    const proj = await this.prisma.project.findUnique({
      where: { key: dto.project },
      select: { active: true },
    });
    if (!proj || !proj.active) throw new BadRequestException('Invalid project');

    const valid = await this.turnstile.verify(dto.turnstileToken, ip);
    if (!valid) throw new BadRequestException('CAPTCHA verification failed');

    const testimonial = testimonialConsent(dto);
    const rating = dto.type === FeedbackType.BUG ? null : (dto.rating ?? null);

    const result = await this.prisma.$queryRaw<{ id: bigint }[]>`
      INSERT INTO feedback (project, type, message, email, user_ctx, context, console_logs, errors, ip,
                            testimonial_ok, testimonial_name, testimonial_at, rating)
      VALUES (
        ${dto.project}, ${dto.type}, ${dto.message}, ${dto.email ?? null},
        ${dto.user ? JSON.stringify(dto.user) : null}::jsonb,
        ${dto.context ? JSON.stringify(dto.context) : null}::jsonb,
        ${dto.console ? JSON.stringify(dto.console) : null}::jsonb,
        ${dto.errors ? JSON.stringify(dto.errors) : null}::jsonb,
        ${ip}::inet,
        ${testimonial.ok}, ${testimonial.name},
        CASE WHEN ${testimonial.ok} THEN now() END,
        ${rating}::smallint
      )
      RETURNING id
    `;

    this.notification.notify({
      project: dto.project,
      type: dto.type,
      message: dto.message,
      id: result[0]?.id?.toString() ?? '',
      testimonial: testimonial.ok,
      rating,
    }).catch(() => {});
  }
}
