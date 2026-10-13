import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { invitationEmail } from './invitation-email';
import { passwordResetEmail } from './password-reset-email';

const data = {
  inviterName: 'Ioana <b>',
  inviterEmail: 'ioana@example.com',
  role: 'admin',
  link: 'https://kudos.example.com/invite/abc123',
  expiresAt: new Date('2026-10-19T10:00:00Z'),
};

const service = (brevo?: { apiKey: string; fromEmail: string }) =>
  new MailService({ get: () => brevo } as unknown as ConfigService);

describe('invitationEmail', () => {
  it('names the inviter, role, link and expiry', () => {
    const { subject, text, html } = invitationEmail(data);
    expect(subject).toBe('Ioana <b> invited you to Kudos Kit');
    expect(text).toContain('as an admin');
    expect(text).toContain(data.link);
    expect(text).toContain('19 October 2026');
    expect(html).toContain(`href="${data.link}"`);
  });

  it('escapes names in the HTML', () => {
    expect(invitationEmail(data).html).toContain('Ioana &lt;b&gt;');
    expect(invitationEmail(data).html).not.toContain('Ioana <b>');
  });
});

describe('passwordResetEmail', () => {
  const reset = { name: 'Mara <i>', link: 'https://kudos.example.com/reset-password?token=t0k3n', expiresInMinutes: 60 };

  it('has the link, the lifetime and a reassuring footer', () => {
    const { subject, text, html } = passwordResetEmail(reset);
    expect(subject).toBe('Reset your Kudos Kit password');
    expect(text).toContain(reset.link);
    expect(text).toContain('60 minutes');
    expect(html).toContain(`href="${reset.link}"`);
    expect(html).toContain('Your password stays the same.');
  });

  it('escapes the name in the HTML', () => {
    expect(passwordResetEmail(reset).html).toContain('Mara &lt;i&gt;');
  });
});

describe('MailService.sendInvitation', () => {
  const fetchMock = jest.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('sends nothing when email is not set up', async () => {
    await service().sendInvitation('new@example.com', data);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts to Brevo with the API key', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    await service({ apiKey: 'key-1', fromEmail: 'hello@example.com' }).sendInvitation('new@example.com', data);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect(init.headers['api-key']).toBe('key-1');
    const body = JSON.parse(init.body);
    expect(body.to).toEqual([{ email: 'new@example.com' }]);
    expect(body.sender.email).toBe('hello@example.com');
  });

  it('sends the password reset email the same way', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    await service({ apiKey: 'k', fromEmail: 'hello@example.com' }).sendPasswordReset('mara@example.com', {
      name: 'Mara', link: 'https://kudos.example.com/reset-password?token=t', expiresInMinutes: 60,
    });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).subject).toBe('Reset your Kudos Kit password');
  });

  it('never throws when Brevo fails', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    await expect(service({ apiKey: 'k', fromEmail: 'f@example.com' }).sendInvitation('x@example.com', data)).resolves.toBeUndefined();
  });
});
