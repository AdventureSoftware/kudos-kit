# Adding the widget to your site

The widget is one script, `kkw.js`, served by your Kudos Kit installation. It adds a small
**Feedback** button to the page. Before you start:

1. **A project.** On the dashboard's **Projects** page, add one for the site: a name, a key
   (e.g. `my-shop`, used in the code below) and a prefix (e.g. `MS`, for references like MS-12).
2. **The spam check knows the site.** In Cloudflare (Turnstile → your widget → Hostnames), add
   the site's domain. A root domain covers its subdomains: `myshop.example` also allows
   `www.myshop.example` and `app.myshop.example`. The free plan allows 10 hostnames per widget.
   See [configuration.md](configuration.md#spam-protection-cloudflare-turnstile).

The **Widget** page in the dashboard writes the code for you, with your project, colours and
keys filled in. The rest of this page explains the options.

## Plain HTML

Paste this just before `</body>` on every page that should have the button:

```html
<script src="https://feedback.example.com/kkw.js"></script>
<script>
  Feedback.init({
    project: 'my-shop',
    turnstileSiteKey: '0x4AAAA…',
    privacyUrl: 'https://feedback.example.com/privacy',
    theme: { mode: 'auto', accent: '#c2410c' },
    console: { enabled: true, max: 150, maxBytes: 50000, redact: true, sendOn: ['bug'] },
  });
</script>
```

## Options

| Option | Default | |
|---|---|---|
| `project` | (required) | The project key from the Projects page. |
| `turnstileSiteKey` | (required) | The Cloudflare Turnstile **site** key (`TURNSTILE_SITE_KEY`). |
| `privacyUrl` | none | Linked under the form. Your installation has one at `/privacy`. |
| `appName` | `"your experience"` | Used in "How would you rate …?". |
| `user` | none | `{ id, plan }` of the signed-in user, shown with each report. Don't put names or emails here. |
| `position` | `'bottom-right'` | `'bottom-left'`, `'top-right'`, `'top-left'`. |
| `offset` | `24` px | Distance from the screen edges in px, e.g. `{ bottom: 96 }` to sit above a cookie bar or chat button. |
| `startHidden` | `false` | Load without showing the button; call `Feedback.show()` later. |
| `branding` | `true` | `false` hides the "Powered by Kudos Kit" line. |
| `theme` | light, neutral | Colours, dark mode, corner rounding, font: see [widget/THEMING.md](../widget/THEMING.md). |
| `console` | off | Captures console messages and uncaught errors for bug reports (below). |
| `apiUrl` | where `kkw.js` came from | Only needed if you host `kkw.js` yourself somewhere else. |

### Console capture

With `console.enabled`, the widget keeps the last `max` console messages (and at most `maxBytes`)
in memory, plus uncaught errors and rejected promises. They are sent only with the feedback
types in `sendOn` (default: bugs) and only when the user presses Send. With `redact: true`,
the values of fields named `password`, `secret`, `token`, `api_key`, `authorization` and
`set-cookie`, and `Bearer …` tokens, are replaced with `[redacted]` before sending. This is
best-effort: don't log personal data you wouldn't want in a bug report.

### App version

If your app sets `window.__APP_VERSION__ = '2.4.1'` (or a commit hash) before the user sends
feedback, every report shows it as **App build**, so you know which release a bug came from.

## JavaScript API

`kkw.js` creates a global `Feedback` object:

| | |
|---|---|
| `Feedback.init(options)` | Adds the button. Calling it again does nothing until `destroy()`. |
| `Feedback.show()` / `hide()` / `toggle()` | Open or close the panel and button, e.g. from your own "Send feedback" menu item. |
| `Feedback.isVisible()` | `true` while the button is shown. |
| `Feedback.setTheme(theme)` | Change colours or light/dark at runtime (only the given keys change). |
| `Feedback.on('submit', ({ type }) => …)` | After feedback was sent. |
| `Feedback.on('visibilitychange', (visible) => …)` | After `show()` / `hide()`. |
| `Feedback.destroy()` | Removes the widget and stops console capture, e.g. when the user signs out. |

## React and Next.js

Most apps want feedback from **signed-in users only**: they're the ones who use the product,
and it keeps anonymous spam away. This component loads the script only when someone is signed
in and removes the widget when they sign out. Put it once in your root layout and pass it the
current user from your auth library (Firebase, Supabase, Auth.js, Clerk…).

```tsx
// src/components/KudosFeedback.tsx
'use client';

import { useEffect } from 'react';

const KUDOS_URL = process.env.NEXT_PUBLIC_KUDOS_URL;                         // e.g. https://feedback.example.com
const SITE_KEY = process.env.NEXT_PUBLIC_KUDOS_TURNSTILE_SITE_KEY;

type KudosUser = { id: string; plan?: string } | null;

declare global {
  interface Window {
    Feedback?: { init(options: object): void; destroy(): void; show(): void; hide(): void };
  }
}

let loading: Promise<void> | null = null;
function loadKudos(): Promise<void> {
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${KUDOS_URL}/kkw.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { loading = null; reject(new Error('Kudos Kit could not be loaded')); };
    document.body.appendChild(script);
  });
  return loading;
}

export function KudosFeedback({ user }: { user: KudosUser }) {
  const userId = user?.id;
  const plan = user?.plan;

  useEffect(() => {
    if (!userId || !KUDOS_URL || !SITE_KEY) return;
    let active = true;
    loadKudos()
      .then(() => {
        if (!active) return;
        window.Feedback?.init({
          project: 'my-shop',
          turnstileSiteKey: SITE_KEY,
          privacyUrl: `${KUDOS_URL}/privacy`,
          appName: 'My Shop',
          user: { id: userId, plan },
          theme: { mode: 'auto', accent: '#c2410c' },
          console: { enabled: true, max: 150, maxBytes: 50000, redact: true, sendOn: ['bug'] },
        });
      })
      .catch(() => { /* feedback is optional: never break the app over it */ });
    return () => {
      active = false;
      window.Feedback?.destroy();
    };
  }, [userId, plan]);

  return null;
}
```

```tsx
// in your root layout, inside whatever provides the current user
<KudosFeedback user={currentUser ? { id: currentUser.uid, plan: currentUser.plan } : null} />
```

And in `.env` (or your hosting's environment settings):

```bash
NEXT_PUBLIC_KUDOS_URL=https://feedback.example.com
NEXT_PUBLIC_KUDOS_TURNSTILE_SITE_KEY=0x4AAAA…
```

Things that catch people out:
- `NEXT_PUBLIC_*` values are **built into** the app. After changing them, rebuild and redeploy;
  restarting isn't enough.
- Import the component without a file extension (`'@/components/KudosFeedback'`). A `.tsx`
  extension in the import breaks `next build`.
- Some YAML-based hosting configs read a site key starting with `0x` as a number: put it in quotes.
- To hide the button on some pages (e.g. checkout), render `<KudosFeedback user={null} />` there,
  or call `window.Feedback?.hide()`.

## Content-Security-Policy

If your site sends a `Content-Security-Policy` header, allow Kudos Kit and Cloudflare's spam check
(replace the address with yours):

| Directive | Add |
|---|---|
| `script-src` | `https://feedback.example.com https://challenges.cloudflare.com` |
| `connect-src` | `https://feedback.example.com` |
| `frame-src` | `https://challenges.cloudflare.com` |
| `style-src` | `'unsafe-inline'` (the widget adds its own `<style>` element) |

## When it doesn't work

| What you see | Usually means |
|---|---|
| No button at all | The script didn't load (check the browser's Network tab and your CSP), the `project` is wrong, or it's turned off on the Projects page. |
| Cloudflare error **400020** | The `turnstileSiteKey` is wrong. |
| Cloudflare error **110200** | The site's domain isn't in the Turnstile widget's hostnames. |
| "CAPTCHA failed" with no Cloudflare box | The server's `TURNSTILE_SECRET` belongs to a different Turnstile widget than the site key. |
| "Failed to send" | The project is off or unknown, the rate limit was reached, or the server is down (`docker compose logs server`). |
