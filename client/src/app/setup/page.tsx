import { redirect } from 'next/navigation';
import { needsSetup } from '@/lib/auth';
import { AuthCard } from '@/components/auth/AuthCard';
import { SetupForm } from '@/components/auth/SetupForm';

export const metadata = { title: 'Set up' };

/** Shown only on a fresh install. Once the owner exists, this page sends everyone to sign in. */
export default async function SetupPage() {
  if (!(await needsSetup())) redirect('/login');
  return (
    <AuthCard subtitle="Welcome! Create the owner account for this Kudos Kit. Others join later by invitation.">
      <SetupForm />
    </AuthCard>
  );
}
