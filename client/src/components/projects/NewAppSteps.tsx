import Link from 'next/link';
import { Card } from '@/components/ui';

/** The whole checklist for connecting a new app, so the Cloudflare step isn't missed. */
export function NewAppSteps() {
  const steps: Array<{ title: string; body: React.ReactNode }> = [
    {
      title: 'Add the project',
      body: 'Use the form above. Choose the key carefully: the app sends it with every report.',
    },
    {
      title: 'Allow its domain in Cloudflare Turnstile',
      body: (
        <>
          In Cloudflare, open the Turnstile widget this server uses and add the app’s domains to its hostname
          list (for example <code className="font-mono text-xs">example.com</code> and{' '}
          <code className="font-mono text-xs">www.example.com</code>). Without this, the button appears but
          sending fails with “CAPTCHA failed”. All apps use this same widget and its site key.
        </>
      ),
    },
    {
      title: 'Put the widget in the app',
      body: (
        <>
          Copy the code from the{' '}
          <Link href="/widget" className="font-semibold text-accent underline underline-offset-2 hover:text-accent-hover">
            Widget page
          </Link>{' '}
          (choose the project there), or in a React or Next.js app pass the key as{' '}
          <code className="font-mono text-xs">project</code> to <code className="font-mono text-xs">Feedback.init()</code>.
          Then send a test report and check it arrives here.
        </>
      ),
    },
  ];

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Connecting a new app</h2>
      <ol className="mt-3 space-y-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span
              aria-hidden
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent"
            >
              {i + 1}
            </span>
            <div>
              <p className="font-medium text-text">{s.title}</p>
              <p className="mt-0.5 text-muted">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
