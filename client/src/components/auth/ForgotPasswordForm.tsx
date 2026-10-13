'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, FormError, Input, Label } from '@/components/ui';
import { authClient, authErrorMessage } from '@/lib/auth-client';

export function ForgotPasswordForm({ emailEnabled }: { emailEnabled: boolean }) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') ?? '').trim();
    setPending(true);
    setError(null);
    const { error } = await authClient.requestPasswordReset({ email });
    setPending(false);
    if (error) return setError(authErrorMessage(error));
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <div className="space-y-4 text-center">
        <p role="status" className="rounded-ui bg-success-soft px-3 py-2 text-success">
          If an account exists for <strong>{sentTo}</strong>, a reset link is on its way. It works for 1 hour.
        </p>
        {!emailEnabled && (
          <p className="text-xs text-muted">
            Email isn’t set up on this server, so the link was written to the server log instead.
          </p>
        )}
        <Link href="/login" className="inline-block text-sm font-medium text-accent hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormError message={error} />
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoFocus autoComplete="email" />
      </div>
      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? 'Sending…' : 'Send reset link'}
      </Button>
      <p className="text-center">
        <Link href="/login" className="text-sm font-medium text-muted hover:text-text">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
