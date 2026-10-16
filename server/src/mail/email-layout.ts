
export const BRAND = '#c2410c';

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

interface LayoutParts {
  introHtml: string;
  buttonLabel: string;
  link: string;
  noteHtml: string;
  footer: string;
}

export function emailLayout({ introHtml, buttonLabel, link, noteHtml, footer }: LayoutParts): string {
  const href = escapeHtml(link);
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px">
      <tr><td style="padding:32px">
        <p style="margin:0 0 24px;font-size:18px;font-weight:600;color:${BRAND}">Kudos Kit</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.5">${introHtml}</p>
        <p style="margin:24px 0">
          <a href="${href}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 20px;border-radius:8px">${escapeHtml(buttonLabel)}</a>
        </p>
        <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#6b7280">
          ${noteHtml} If the button doesn't work, copy this address into your browser:<br>
          <a href="${href}" style="color:${BRAND};word-break:break-all">${href}</a>
        </p>
        <p style="margin:16px 0 0;font-size:13px;color:#6b7280">${escapeHtml(footer)}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export interface Email {
  subject: string;
  html: string;
  text: string;
}
