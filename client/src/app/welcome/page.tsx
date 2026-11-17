import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getSetupStatus } from '@/lib/auth';
import { LandingPage } from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: { absolute: 'Kudos Kit · Self-hosted feedback for your apps' },
  description:
    'Add one script tag and your users can report bugs, share ideas and send praise. Your team reads it all in one inbox. Open source, runs on your own server.',
  robots: { index: true, follow: true },
};

/**
 * The public home page for visitors who aren't signed in (proxy.ts shows it at /).
 * On by default. LANDING_PAGE=false turns it off: visitors then go straight to the sign-in page,
 * for installations that don't want the Kudos Kit introduction on their own domain.
 */
export default async function WelcomePage() {
  await connection();
  const { needsSetup, retentionDays } = await getSetupStatus();
  if (needsSetup) redirect('/setup');
  if (process.env.LANDING_PAGE?.trim().toLowerCase() === 'false') redirect('/login');
  return <LandingPage retentionDays={retentionDays} />;
}
