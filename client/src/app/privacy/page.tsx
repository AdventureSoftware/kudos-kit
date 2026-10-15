import Link from 'next/link';
import { connection } from 'next/server';
import { Logo } from '@/components/Logo';
import { getSetupStatus } from '@/lib/auth';
import { getPrivacyOperator } from '@/lib/privacy';

export const metadata = { title: 'Privacy' };


const LAST_UPDATED = '14 October 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-text">{title}</h2>
      {children}
    </section>
  );
}


export default async function PrivacyPage() {
  await connection(); // read settings on every request, not once at build time
  const [{ emailEnabled, providers, retentionDays }, who] = [await getSetupStatus(), getPrivacyOperator()];
  const operator = who.operator ?? 'the organisation that runs this Kudos Kit';
  const contact = who.contactEmail ? (
    <a href={`mailto:${who.contactEmail}`} className="font-medium text-accent hover:underline">{who.contactEmail}</a>
  ) : (
    'the team that runs this Kudos Kit'
  );

  const processors = [
    { name: 'Hosting', text: who.hosting ?? 'The server and database that run this Kudos Kit.' },
    { name: 'Cloudflare Turnstile', text: 'Checks that feedback is sent by a person, not a bot, when you use the widget. Cloudflare processes technical data such as your IP address and browser details for this.', href: 'https://www.cloudflare.com/privacypolicy/' },
    ...(emailEnabled ? [{ name: 'Brevo', text: 'Sends emails: alerts about new feedback to the team (with the start of the message), invitations and password reset links.', href: 'https://www.brevo.com/legal/privacypolicy/' }] : []),
    ...(providers.includes('google') ? [{ name: 'Google', text: 'Only if you choose “Continue with Google”: Google tells us your name, email address, profile picture link and an account identifier.', href: 'https://policies.google.com/privacy' }] : []),
    ...(providers.includes('apple') ? [{ name: 'Apple', text: 'Only if you choose “Continue with Apple”: Apple tells us an account identifier and an email address (which may be a private relay address).', href: 'https://www.apple.com/legal/privacy/' }] : []),
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/login" aria-label="Kudos Kit" className="inline-flex"><Logo size={28} /></Link>
      <h1 className="mt-8 text-2xl font-semibold text-text">Privacy</h1>
      <p className="mt-1 text-muted">Last updated {LAST_UPDATED}</p>

      <div className="mt-8 space-y-8 leading-relaxed text-text">
        <Section title="Who we are">
          <p>
            This Kudos Kit is run by {operator}. It collects feedback through a small widget in our apps and websites,
            and lets our team read it in this dashboard. For any question or request about your data, contact {contact}.
          </p>
        </Section>

        <Section title="When you send feedback">
          <p>We receive what you write and some technical details that help us understand and fix the problem:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>The type (bug, idea, praise or other), your message, and your email address if you give it.</li>
            <li>If you are signed in to our app: your account identifier and plan, as the app passes them to the widget.</li>
            <li>The page address and the page you came from, your browser and operating system, screen size, language, the app version and the time.</li>
            <li>Your IP address, to block spam and abuse.</li>
            <li>
              For bug reports only: recent messages and errors from the page’s developer console. We automatically hide
              things that look like passwords, tokens and keys, but this can’t catch everything, so please don’t write
              sensitive information in your message.
            </li>
          </ul>
          <p>
            We use this only to fix problems and improve our products, which is our legitimate interest (GDPR Art. 6(1)(f)).
            We don’t sell it, don’t use it for advertising, and the widget itself stores nothing on your device.
          </p>
        </Section>

        <Section title="Testimonials">
          <p>
            When you send praise, you can tick “You may show my message publicly as a testimonial”. Only then may we show
            your message publicly, for example on our website, with the name you entered, or as “Anonymous” if you left it
            empty. We never show your email address. We record when you gave this consent (GDPR Art. 6(1)(a)).
          </p>
          <p>
            It’s optional, and you can withdraw it at any time by writing to {contact}. We then stop using your message
            and remove it from places we control.
          </p>
        </Section>

        <Section title="Team accounts in this dashboard">
          <p>
            For people with access to the dashboard we keep: name, email address, role in the team, the password as a
            secure one-way hash (never the password itself), linked Google or Apple sign-in, and current logins with
            their IP address and browser, for security. We need this to give you access (GDPR Art. 6(1)(b) and (f)).
          </p>
          <p>The dashboard uses one cookie, to keep you signed in. There are no analytics or advertising cookies.</p>
        </Section>

        <Section title="Who else handles the data">
          <ul className="space-y-2">
            {processors.map((p) => (
              <li key={p.name}>
                <span className="font-medium">{p.name}</span>: {p.text}{' '}
                {p.href && <a href={p.href} className="text-accent hover:underline" rel="noreferrer" target="_blank">Their privacy policy</a>}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="How long we keep it">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              {retentionDays > 0
                ? `Feedback is deleted automatically after ${retentionDays} days, or earlier if you ask.`
                : 'Feedback is kept until our team deletes it, or until you ask us to.'}
            </li>
            <li>
              Praise you allowed us to use as a testimonial is kept until you withdraw consent or we stop using it.
              {retentionDays > 0 &&
                ` After ${retentionDays} days we remove its technical details (IP address, page and browser details, console logs).`}
            </li>
            <li>Logins end after 7 days without use and are then deleted.</li>
            <li>Invitations are deleted 30 days after they expire.</li>
            <li>Team accounts are deleted when the person is removed from the team.</li>
          </ul>
        </Section>

        <Section title="Your rights">
          <p>
            You can ask to see, correct or delete your data, to limit how we use it, to object to its use, or to receive
            a copy. Write to {contact}; tell us roughly when you sent feedback and from which app so we can find it.
            You can also complain to {who.authority ?? 'the data protection authority in your country'}.
          </p>
        </Section>
      </div>

      <p className="mt-12 border-t border-border pt-6 text-xs text-muted">
        Kudos Kit is open-source feedback software. <Link href="/login" className="hover:text-text">Sign in</Link>
      </p>
    </div>
  );
}
