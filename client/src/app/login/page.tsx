import { redirect } from 'next/navigation';
import { getSessionUser, getSetupStatus } from '@/lib/auth';
import { socialErrorMessage } from '@/lib/social';
import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForm } from '@/components/auth/LoginForm';
import { OrDivider, SocialButtons } from '@/components/auth/SocialButtons';

export const metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ needsSetup, providers }, user, { error }] = await Promise.all([getSetupStatus(), getSessionUser(), searchParams]);
  if (needsSetup) redirect('/setup');
  if (user) redirect('/');
  return (
    <AuthCard subtitle="Sign in to your feedback inbox">
      {providers.length > 0 && (
        <>
          <SocialButtons providers={providers} callbackURL="/" errorCallbackURL="/login" />
          <OrDivider />
        </>
      )}
      <LoginForm initialError={socialErrorMessage(error)} />
    </AuthCard>
  );
}
