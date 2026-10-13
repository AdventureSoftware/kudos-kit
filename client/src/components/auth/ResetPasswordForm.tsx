'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, FormError, buttonClass } from '@/components/ui';
import { authClient, authErrorMessage } from '@/lib/auth-client';
import { newPasswordError } from '@/lib/password';
import { NewPasswordFields } from './NewPasswordFields';


export function ResetPasswordForm({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const invalid = newPasswordError(form);
    if (invalid) return setError(invalid);

    setPending(true);
    setError(null);
    const { error } = await authClient.resetPassword({ newPassword: String(form.get('password')), token });
    setPending(false);
    if (error?.code === 'INVALID_TOKEN') return setExpired(true);
    if (error) return setError(authErrorMessage(error));
    setDone(true);
  }

  if (done || expired) {
    return (
      <div className="space-y-4 text-center">
        <p role="status" className={done ? 'rounded-ui bg-success-soft px-3 py-2 text-success' : 'text-muted'}>
          {done
            ? 'Your password is changed. You were signed out everywhere, so sign in with the new one.'
            : 'This reset link has expired or was already used.'}
        </p>
        <Link href={done ? '/login' : '/forgot-password'} className={buttonClass('primary', 'md', 'w-full')}>
          {done ? 'Sign in' : 'Get a new link'}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormError message={error} />
      <NewPasswordFields label="New password" autoFocus />
      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? 'Saving…' : 'Save new password'}
      </Button>
    </form>
  );
}
