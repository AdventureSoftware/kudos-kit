import { Icon, TYPE_ICONS } from './icons';

interface Feature {
  title: string;
  text: string;
  icon: React.ReactNode;
}

export function Features({ retentionDays }: { retentionDays: number }) {
  const deletion =
    retentionDays > 0 ? `feedback deleted automatically after ${retentionDays} days` : 'automatic deletion when you want it';

  const features: Feature[] = [
    {
      title: 'Bug reports you can act on',
      text: 'Page, browser, screen size and app version come with every message. Bug reports also bring the console log.',
      icon: TYPE_ICONS.bug,
    },
    {
      title: 'Ideas, praise and ratings',
      text: 'Optional star ratings. Happy users can let you show their praise as a testimonial, and their consent is recorded.',
      icon: TYPE_ICONS.praise,
    },
    {
      title: 'One inbox for every app',
      text: 'Filters, search and a simple status: new, triaged, done. Each message gets a short reference like APP-12, per project.',
      icon: <><path d="M4 13h4l1.5 3h5L16 13h4" /><path d="M5.5 5h13l1.5 8v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z" /></>,
    },
    {
      title: 'Built for your team',
      text: 'Invite-only accounts with owner, admin and member roles. Sign in with a password or Google, and get an email when feedback arrives.',
      icon: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18.5 14.5A6.5 6.5 0 0 1 21.5 20" /></>,
    },
    {
      title: 'Privacy built in',
      text: `Spam check with Cloudflare Turnstile, rate limits, a ready-made privacy page and ${deletion}.`,
      icon: <><path d="M12 2.8 4.5 5.6v5.9c0 4.6 3.1 8.4 7.5 9.7 4.4-1.3 7.5-5.1 7.5-9.7V5.6z" /><path d="m8.8 12 2.2 2.2 4.2-4.4" /></>,
    },
    {
      title: 'Yours to run',
      text: 'Open source under the MIT licence. Runs on your own server with Docker, next to your other sites. Your users’ messages stay with you.',
      icon: <><rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /><path d="M7 7.5h.01M7 16.5h.01" /></>,
    },
  ];

  return (
    <section id="features" className="scroll-mt-20 border-t border-border bg-surface py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold tracking-wide text-accent uppercase">Features</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-balance">
            Everything you need to listen, nothing you don’t.
          </h2>
          <p className="mt-3 text-muted">
            A small widget for your users and a calm inbox for your team. No tracking, no sales funnel, no lock-in.
          </p>
        </div>
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Icon>{f.icon}</Icon>
              </span>
              <h3 className="mt-4 font-bold">{f.title}</h3>
              <p className="mt-1.5 leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
