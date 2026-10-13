import { emailLayout, escapeHtml, type Email } from './email-layout';

export interface InvitationEmailData {
  inviterName: string;
  inviterEmail: string;
  role: string;
  link: string;
  expiresAt: Date;
}

const roleLabel = (role: string) => (role === 'admin' ? 'an admin' : 'a member');

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });


export function invitationEmail(data: InvitationEmailData): Email {
  const until = formatDate(data.expiresAt);
  const footer = "If you weren't expecting this, you can ignore this email.";
  return {
    subject: `${data.inviterName} invited you to Kudos Kit`,
    text: [
      `${data.inviterName} (${data.inviterEmail}) invited you to join their Kudos Kit feedback inbox as ${roleLabel(data.role)}.`,
      '',
      `Create your account here: ${data.link}`,
      '',
      `The link works until ${until}. ${footer}`,
    ].join('\n'),
    html: emailLayout({
      introHtml: `<strong>${escapeHtml(data.inviterName)}</strong> (${escapeHtml(data.inviterEmail)}) invited you to join their Kudos Kit feedback inbox as ${roleLabel(data.role)}.`,
      buttonLabel: 'Accept invitation',
      link: data.link,
      noteHtml: `The link works until ${until}.`,
      footer,
    }),
  };
}
