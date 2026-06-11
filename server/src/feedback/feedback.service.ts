import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TurnstileService } from './turnstile.service';
import { NotificationService } from './notification.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private db: DatabaseService,
    private turnstile: TurnstileService,
    private notification: NotificationService,
  ) {}

  async submit(dto: CreateFeedbackDto, ip: string): Promise<void> {
    if (dto.hp) return;

    const proj = await this.db.query<{ active: boolean }>(
      'SELECT active FROM projects WHERE key = $1',
      [dto.project],
    );
    if (!proj.rows.length || !proj.rows[0].active) {
      throw new BadRequestException('Invalid project');
    }

    const valid = await this.turnstile.verify(dto.turnstileToken, ip);
    if (!valid) throw new BadRequestException('CAPTCHA verification failed');

    const result = await this.db.query<{ id: string }>(
      `INSERT INTO feedback
         (project, type, message, email, user_ctx, context, console_logs, errors, ip)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::inet)
       RETURNING id`,
      [
        dto.project,
        dto.type,
        dto.message,
        dto.email ?? null,
        dto.user ? JSON.stringify(dto.user) : null,
        dto.context ? JSON.stringify(dto.context) : null,
        dto.console ? JSON.stringify(dto.console) : null,
        dto.errors ? JSON.stringify(dto.errors) : null,
        ip,
      ],
    );

    this.notification.notify({
      project: dto.project,
      type: dto.type,
      message: dto.message,
      id: result.rows[0].id,
    }).catch(() => {});
  }
}
