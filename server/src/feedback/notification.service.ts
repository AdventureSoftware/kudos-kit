// server/src/feedback/notification.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface NotifyPayload {
  project: string;
  type: string;
  message: string;
  id: string;
}

@Injectable()
export class NotificationService {
  private lastSentAt = 0;
  private readonly throttleMs = 60_000;

  constructor(private config: ConfigService) {}

  async notify(payload: NotifyPayload): Promise<void> {
    if (Date.now() - this.lastSentAt < this.throttleMs) return;
    this.lastSentAt = Date.now();

    const apiKey = this.config.get<string>('brevo.apiKey') ?? '';
    const fromEmail = this.config.get<string>('brevo.fromEmail') ?? '';
    const toEmail = this.config.get<string>('brevo.toEmail') ?? '';
    const adminUrl = this.config.get<string>('adminUrl') ?? '';

    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { email: fromEmail },
        to: [{ email: toEmail }],
        subject: `[${payload.project}] New ${payload.type} report`,
        textContent: [
          payload.message.slice(0, 200),
          '',
          `${adminUrl}/admin`,
        ].join('\n'),
      }),
    });
  }
}
