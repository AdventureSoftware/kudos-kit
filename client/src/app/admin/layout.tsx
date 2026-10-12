import { redirect } from 'next/navigation';
import { getSessionUser, needsSetup } from '@/lib/auth';
import { AppHeader } from '@/components/AppHeader';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect((await needsSetup()) ? '/setup' : '/login');

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
