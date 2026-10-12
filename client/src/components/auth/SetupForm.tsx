'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/components/ui';
import { authClient, authErrorMessage } from '@/lib/auth-client';
import { FormError } from './AuthCard';

const MIN_PASSWORD = 10;

/** Creates the very first account, which becomes the team's owner. */
export function SetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password') ?? '');
    if (password.length < MIN_PASSWORD) return setError(`The password needs at least ${MIN_PASSWORD} characters.`);
    if (password !== form.get('confirm')) return setError('The two passwords do not match.');

    setPending(true);
    setError(null);
    const { error } = await authClient.signUp.email({
      name: String(form.get('name') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      password,
    });
    if (error) {
      setError(authErrorMessage(error));
      setPending(false);
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormError message={error} />
      <div>
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" required autoFocus autoComplete="name" maxLength={100} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" />
        <p className="mt-1 text-xs text-muted">At least {MIN_PASSWORD} characters.</p>
      </div>
      <div>
        <Label htmlFor="confirm">Repeat password</Label>
        <Input id="confirm" name="confirm" type="password" required autoComplete="new-password" />
      </div>
      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? 'Creating account…' : 'Create owner account'}
      </Button>
    </form>
  );
}
