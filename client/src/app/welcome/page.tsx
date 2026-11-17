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

export default async function WelcomePage() {
  await connection();
  const { needsSetup, retentionDays } = await getSetupStatus();
  if (needsSetup) redirect('/setup');
  return <LandingPage retentionDays={retentionDays} />;
}
