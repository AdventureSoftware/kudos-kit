
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface NotifyPayload {
  project: string;
  type: string;
  message: string;
  id: string;
  testimonial?: boolean;
  rating?: number | null;
}

const SUBJECTS: Record<string, string> = {
  bug: 'New bug report',
  idea: 'New idea',
  praise: 'New praise',
  other: 'New feedback',
};

@Injectable()
export class NotificationService {
  private lastSentAt = 0;
  private readonly throttleMs = 60_000;

  constructor(private config: ConfigService) {}

  async notify(payload: NotifyPayload): Promise<void> {
    if (Date.now() - this.lastSentAt < this.throttleMs) return;

    const apiKey = this.config.get<string>('brevo.apiKey') ?? '';
    const fromEmail = this.config.get<string>('brevo.fromEmail') ?? '';
    const toEmail = this.config.get<string>('brevo.toEmail') ?? '';
    const adminUrl = this.config.get<string>('adminUrl') ?? '';
    // Email is optional: without Brevo settings there is no one to tell, so don't try.
    if (!apiKey || !fromEmail || !toEmail) return;

    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { email: fromEmail },
          to: [{ email: toEmail }],
          subject: `[${payload.project}] ${SUBJECTS[payload.type] ?? 'New feedback'}`,
          textContent: [
            payload.message.slice(0, 200),
            '',
            ...(payload.rating ? [`Rating: ${'★'.repeat(payload.rating)}${'☆'.repeat(5 - payload.rating)} (${payload.rating}/5)`] : []),
            ...(payload.testimonial ? ['✓ May be used as a testimonial.'] : []),
            ...(payload.rating || payload.testimonial ? [''] : []),
            `${adminUrl}/feedback?item=${payload.id}`,
          ].join('\n'),
        }),
      });
      if (!res.ok) {
        console.error(`Brevo notification failed: ${res.status}`);
      }
    } catch (err) {
      console.error('Brevo notification error', err);
    } finally {
      this.lastSentAt = Date.now();
    }
  }
}
