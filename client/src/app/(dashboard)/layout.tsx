import { redirect } from 'next/navigation';
import { getMemberRole, getSessionUser, needsSetup } from '@/lib/auth';
import { AppHeader } from '@/components/AppHeader';
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

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
