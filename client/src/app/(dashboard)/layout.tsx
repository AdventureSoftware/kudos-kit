import { redirect } from 'next/navigation';
import { getMemberRole, getSessionUser, needsSetup } from '@/lib/auth';
import { AppShell } from '@/components/nav/AppShell';
import { AuthCard } from '@/components/auth/AuthCard';
import { SignOutButton } from '@/components/auth/SignOutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect((await needsSetup()) ? '/setup' : '/login');


  if (!(await getMemberRole())) {
    return (
      <AuthCard subtitle="You're not in the team yet.">
        <p className="text-center text-muted">
          Open your invitation link again to join, or ask an owner or admin to invite <strong className="text-text">{user.email}</strong>.
        </p>
        <div className="mt-6 flex justify-center">
          <SignOutButton />
        </div>
      </AuthCard>
    );
  }

  return <AppShell user={user}>{children}</AppShell>;
}
