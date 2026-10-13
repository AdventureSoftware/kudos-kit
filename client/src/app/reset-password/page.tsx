import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/AuthCard';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { buttonClass } from '@/components/ui';


export const metadata: Metadata = { title: 'Choose a new password', referrer: 'no-referrer' };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard subtitle="This reset link is incomplete.">
        <p className="text-center text-muted">Open the link from the email again, or ask for a new one.</p>
        <Link href="/forgot-password" className={buttonClass('primary', 'md', 'mt-6 w-full')}>
          Get a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard subtitle="Choose a new password for your account.">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
