import { redirect } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { AppHeader } from '@/components/AppHeader';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  if (!token) redirect('/login');

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
