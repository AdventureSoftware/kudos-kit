import { emailLayout, escapeHtml, type Email } from './email-layout';

export interface PasswordResetEmailData {
  name: string;
  link: string;
  expiresInMinutes: number;
}


export function passwordResetEmail(data: PasswordResetEmailData): Email {
  const footer = "If you didn't ask for this, you can ignore this email. Your password stays the same.";
  const lifetime = `${data.expiresInMinutes} minutes`;
  return {
    subject: 'Reset your Kudos Kit password',
    text: [
      `Hi ${data.name},`,
      '',
      `Someone (hopefully you) asked to reset your Kudos Kit password. Choose a new one here: ${data.link}`,
      '',
      `The link works for ${lifetime}, once. ${footer}`,
    ].join('\n'),
    html: emailLayout({
      introHtml: `Hi ${escapeHtml(data.name)}, someone (hopefully you) asked to reset your Kudos Kit password.`,
      buttonLabel: 'Choose a new password',
      link: data.link,
      noteHtml: `The link works for ${lifetime}, once.`,
      footer,
    }),
  };
}
