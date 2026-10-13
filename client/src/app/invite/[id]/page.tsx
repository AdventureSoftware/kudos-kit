import Link from 'next/link';
import { getInvitation, getSessionUser, getSetupStatus } from '@/lib/auth';
import { socialErrorMessage } from '@/lib/social';
import { AuthCard } from '@/components/auth/AuthCard';
import { JoinForm } from '@/components/auth/JoinForm';
import { OrDivider, SocialButtons } from '@/components/auth/SocialButtons';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { buttonClass } from '@/components/ui';

export const metadata = { title: 'Join the team' };

const article = (role: string) => (role === 'admin' ? 'an admin' : 'a member');

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; joined?: string }>;
}) {
  const [{ id }, { error, joined }] = await Promise.all([params, searchParams]);
  const [invite, user, { providers }] = await Promise.all([getInvitation(id), getSessionUser(), getSetupStatus()]);

  if (!invite) {
    return (
      <AuthCard subtitle="This invitation link is no longer valid.">
        <p className="text-center text-muted">
          It may have expired, been cancelled, or already been used. Ask the person who invited you to send a new one.
        </p>
        <Link href="/login" className={buttonClass('secondary', 'md', 'mt-6 w-full')}>
          Go to sign in
        </Link>
      </AuthCard>
    );
  }

  const subtitle = `${invite.inviterName} invited you to join this Kudos Kit as ${article(invite.role)}.`;

  if (user && user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <AuthCard subtitle={subtitle}>
        <p className="text-center text-muted">
          This invitation is for <strong className="text-text">{invite.email}</strong>, but you are signed in as{' '}
          <strong className="text-text">{user.email}</strong>. Sign out to continue.
        </p>
        <div className="mt-6 flex justify-center">
          <SignOutButton redirectTo={`/invite/${id}`} label="Sign out and continue" />
        </div>
      </AuthCard>
    );
  }

  const mode = user ? 'accept' : invite.hasAccount ? 'signin' : 'create';
  // Apple isn't offered here: with "Hide My Email" its address can't match the invitation.
  // People connect Apple later, on their Account page.
  const showGoogle = mode === 'create' && providers.includes('google');
  return (
    <AuthCard subtitle={subtitle}>
      {showGoogle && (
        <>
          <SocialButtons
            providers={['google']}
            requestSignUp
            callbackURL={`/invite/${id}?joined=1`}
            errorCallbackURL={`/invite/${id}`}
            verb="Join with"
          />
          <p className="mt-2 text-center text-xs text-muted">Use the Google account for {invite.email}.</p>
          <OrDivider />
        </>
      )}
      <JoinForm
        invitationId={id}
        email={invite.email}
        mode={mode}
        autoJoin={joined === '1'}
        initialError={socialErrorMessage(error)}
      />
    </AuthCard>
  );
}
