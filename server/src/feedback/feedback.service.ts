import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaIngestService } from '../prisma/prisma-ingest.service';
import { TurnstileService } from './turnstile.service';
import { NotificationService } from './notification.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

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

    const result = await this.prisma.$queryRaw<{ id: bigint }[]>`
      INSERT INTO feedback (project, type, message, email, user_ctx, context, console_logs, errors, ip)
      VALUES (
        ${dto.project}, ${dto.type}, ${dto.message}, ${dto.email ?? null},
        ${dto.user ? JSON.stringify(dto.user) : null}::jsonb,
        ${dto.context ? JSON.stringify(dto.context) : null}::jsonb,
        ${dto.console ? JSON.stringify(dto.console) : null}::jsonb,
        ${dto.errors ? JSON.stringify(dto.errors) : null}::jsonb,
        ${ip}::inet
      )
      RETURNING id
    `;

    this.notification.notify({
      project: dto.project,
      type: dto.type,
      message: dto.message,
      id: result[0]?.id?.toString() ?? '',
    }).catch(() => {});
  }
}
