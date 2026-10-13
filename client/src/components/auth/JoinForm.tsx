'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, FormError, Input, Label } from '@/components/ui';
import { authClient, authErrorMessage } from '@/lib/auth-client';
import { newPasswordError } from '@/lib/password';
import { NewPasswordFields } from './NewPasswordFields';

interface JoinFormProps {
  invitationId: string;
  email: string;
  mode: 'create' | 'signin' | 'accept';
  autoJoin?: boolean;
  initialError?: string | null;
}


export function JoinForm({ invitationId, email, mode, autoJoin, initialError = null }: JoinFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(initialError);
  useEffect(() => {
    if (autoJoin && mode === 'accept') formRef.current?.requestSubmit();
  }, [autoJoin, mode]);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password') ?? '');
    if (mode === 'create') {
      const invalid = newPasswordError(form);
      if (invalid) return setError(invalid);
    }

    setPending(true);
    setError(null);
    const fail = (err: Parameters<typeof authErrorMessage>[0]) => {
      setError(authErrorMessage(err));
      setPending(false);
      if (mode !== 'accept') router.refresh();
    };

    if (mode === 'create') {
      const { error } = await authClient.signUp.email({ name: String(form.get('name') ?? '').trim(), email, password });
      if (error) {
        setError(authErrorMessage(error));
        setPending(false);
        return;
      }
    } else if (mode === 'signin') {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        setError(authErrorMessage(error));
        setPending(false);
        return;
      }
    }

    const { error } = await authClient.organization.acceptInvitation({ invitationId });
    if (error) return fail(error);
    router.replace('/');
    router.refresh();
  }

  const submitLabel = { create: 'Create account and join', signin: 'Sign in and join', accept: 'Join the team' }[mode];

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <FormError message={error} />
      {mode !== 'accept' && (
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} readOnly className="bg-surface-muted text-muted" />
        </div>
      )}
      {mode === 'create' && (
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required autoFocus autoComplete="name" maxLength={100} />
        </div>
      )}
      {mode === 'create' && <NewPasswordFields />}
      {mode === 'signin' && (
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoFocus autoComplete="current-password" />
        </div>
      )}
      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? 'Joining…' : submitLabel}
      </Button>
    </form>
  );
}
