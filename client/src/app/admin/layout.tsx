import { redirect } from 'next/navigation';
import { getToken } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  if (!token) redirect('/login');
  return <>{children}</>;
}
