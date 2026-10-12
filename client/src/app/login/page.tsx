import { redirect } from 'next/navigation';
import { getSessionUser, needsSetup } from '@/lib/auth';
import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = { title: 'Sign in' };

export default async function LoginPage() {
  if (await needsSetup()) redirect('/setup');
  if (await getSessionUser()) redirect('/admin');
  return (
    <AuthCard subtitle="Sign in to your feedback inbox">
      <LoginForm />
    </AuthCard>
  );
}
