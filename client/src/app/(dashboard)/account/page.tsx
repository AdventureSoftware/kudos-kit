import { redirect } from 'next/navigation';
import { apiFetch, getMemberRole, getSessionUser, getSetupStatus } from '@/lib/auth';
import { PROVIDER_NAMES, socialErrorMessage, type SocialProvider } from '@/lib/social';
import { PasswordForm } from '@/components/account/PasswordForm';
import { ProfileForm } from '@/components/account/ProfileForm';
import { SessionsCard } from '@/components/account/SessionsCard';
import { SignInMethods } from '@/components/account/SignInMethods';

export const metadata = { title: 'Account' };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ connected?: string; error?: string }> }) {
  const [user, role, sessionsRes, accountsRes, { providers }, { connected, error }] = await Promise.all([
    getSessionUser(),
    getMemberRole(),
    apiFetch('/api/auth/list-sessions'),
    apiFetch('/api/auth/list-accounts'),
    getSetupStatus(),
    searchParams,
  ]);
  if (!user) redirect('/login');
  const sessions = sessionsRes.ok ? ((await sessionsRes.json()) as unknown[]) : [];
  const methods = accountsRes.ok ? ((await accountsRes.json()) as Array<{ id: string; providerId: string }>) : [];
  const has = (providerId: string) => methods.some((m) => m.providerId === providerId);

  const connectedName = PROVIDER_NAMES[connected as SocialProvider];
  const notice = error
    ? { tone: 'danger' as const, text: socialErrorMessage(error)! }
    : connectedName && has(connected!)
      ? { tone: 'success' as const, text: `${connectedName} is connected. You can now sign in with it.` }
      : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Account</h1>
        <p className="text-muted">Your name, password and logins.</p>
      </div>
      <ProfileForm name={user.name} email={user.email} role={role ?? 'member'} />
      {has('credential') && <PasswordForm />}
      <SignInMethods methods={methods} providers={providers} email={user.email} notice={notice} />
      <SessionsCard count={Math.max(1, sessions.length)} />
    </div>
  );
}
