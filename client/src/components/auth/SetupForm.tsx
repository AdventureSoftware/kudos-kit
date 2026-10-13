'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/components/ui';
import { newPasswordError } from '@/lib/password';
import { authClient, authErrorMessage } from '@/lib/auth-client';
import { FormError } from './AuthCard';
import { NewPasswordFields } from './NewPasswordFields';

/** Creates the very first account, which becomes the team's owner. */
export function SetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const invalid = newPasswordError(form);
    if (invalid) return setError(invalid);
    const password = String(form.get('password'));

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
    router.replace('/');
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
      <NewPasswordFields />
      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? 'Creating account…' : 'Create owner account'}
      </Button>
    </form>
  );
}
