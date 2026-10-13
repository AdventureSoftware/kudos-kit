import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Email } from './email-layout';
import { invitationEmail, type InvitationEmailData } from './invitation-email';
import { passwordResetEmail, type PasswordResetEmailData } from './password-reset-email';

export interface MailSettings {
  apiKey: string;
  fromEmail: string;
}


export interface Mailer {
  sendInvitation(to: string, data: InvitationEmailData): Promise<void>;
  sendPasswordReset(to: string, data: PasswordResetEmailData): Promise<void>;
}

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

@Injectable()
export class MailService implements Mailer {
  private readonly logger = new Logger('Mail');
  private readonly settings: MailSettings;

  constructor(config: ConfigService) {
    this.settings = config.get<MailSettings>('brevo') ?? { apiKey: '', fromEmail: '' };
  }

  isConfigured(): boolean {
    return Boolean(this.settings.apiKey && this.settings.fromEmail);
  }

  sendInvitation(to: string, data: InvitationEmailData): Promise<void> {
    return this.send(to, invitationEmail(data), `Invite link for ${to}: ${data.link}`);
  }

  sendPasswordReset(to: string, data: PasswordResetEmailData): Promise<void> {
    return this.send(to, passwordResetEmail(data), `Password reset link for ${to}: ${data.link}`);
  }


  private async send(to: string, email: Email, fallbackLog: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn(`Email is not set up (BREVO_API_KEY / BREVO_FROM_EMAIL). ${fallbackLog}`);
      return;
    }
    try {
      const res = await fetch(BREVO_URL, {
        method: 'POST',
        headers: { 'api-key': this.settings.apiKey, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          sender: { email: this.settings.fromEmail, name: 'Kudos Kit' },
          to: [{ email: to }],
          subject: email.subject,
          htmlContent: email.html,
          textContent: email.text,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) this.logger.error(`Brevo refused the email "${email.subject}" to ${to}: ${res.status} ${await res.text()}`);
    } catch (err) {
      this.logger.error(`Could not reach Brevo for the email "${email.subject}" to ${to}: ${String(err)}`);
    }
  }
}
