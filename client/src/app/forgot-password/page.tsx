import { getSetupStatus } from '@/lib/auth';
import { AuthCard } from '@/components/auth/AuthCard';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata = { title: 'Forgot password' };

export default async function ForgotPasswordPage() {
  const { emailEnabled } = await getSetupStatus();
  return (
    <AuthCard subtitle="Enter your email and we’ll send you a link to choose a new password.">
      <ForgotPasswordForm emailEnabled={emailEnabled} />
    </AuthCard>
  );
}
