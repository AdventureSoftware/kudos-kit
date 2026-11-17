import Link from 'next/link';
import { buttonClass } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { ProductPreview } from './ProductPreview';
import { Features } from './Features';
import { HowItWorks } from './HowItWorks';


export function LandingPage({ retentionDays }: { retentionDays: number }) {
  return (
    <div className="flex flex-1 flex-col text-base">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <Features retentionDays={retentionDays} />
        <HowItWorks />
        <ClosingCta />
      </main>
      <LandingFooter />
    </div>
  );
}

const container = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';

function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-bg/80 backdrop-blur">
      <div className={`${container} flex h-16 items-center justify-between gap-4`}>
        <Link href="/" aria-label="Kudos Kit home" className="inline-flex">
          <Logo size={30} />
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <a href="#features" className="hidden rounded-ui px-3 py-2 text-muted hover:text-text sm:inline-block">Features</a>
          <a href="#how-it-works" className="hidden rounded-ui px-3 py-2 text-muted hover:text-text sm:inline-block">How it works</a>
          <Link href="/privacy" className="hidden rounded-ui px-3 py-2 text-muted hover:text-text md:inline-block">Privacy</Link>
          <Link href="/login" className={buttonClass('primary', 'md', 'ml-2')}>Sign in</Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_75%_10%,var(--accent-soft),transparent)]"
      />
      <div className={`${container} relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:py-24`}>
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            Open source · Self-hosted
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-5xl">
            Hear what your users <span className="text-accent">really</span> think.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Add one script tag and your users get a small Feedback button. They report a bug, share an idea or send
            praise, and your team reads it all in one inbox, with the page, browser and console log attached.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className={buttonClass('primary', 'md', 'h-11 px-5 text-base')}>Sign in</Link>
            <a href="#how-it-works" className={buttonClass('secondary', 'md', 'h-11 px-5 text-base')}>See how it works</a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {['Free, MIT licensed', 'Runs on your own server', 'No tracking cookies'].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-4 text-success" aria-hidden>
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className={`${container} pb-20`}>
      <div className="rounded-2xl bg-brand px-6 py-12 text-center text-white sm:px-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
          Your users already have opinions. Give them a place to say them.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/85">
          Kudos Kit is free and open source. Run it next to your other sites with Docker, and keep every message on
          your own server.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-ui bg-white px-5 font-semibold text-[#9a3412] transition-colors hover:bg-white/90"
          >
            Sign in to your inbox
          </Link>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className={`${container} flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted sm:flex-row`}>
        <div className="flex items-center gap-2">
          <Logo size={20} />
          <span>· Open-source feedback software</span>
        </div>
        <nav className="flex gap-5">
          <Link href="/privacy" className="hover:text-text">Privacy</Link>
          <Link href="/login" className="hover:text-text">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
