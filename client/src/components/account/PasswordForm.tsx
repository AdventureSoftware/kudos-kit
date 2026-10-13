'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, FormError, Input, Label } from '@/components/ui';
import { NewPasswordFields } from '@/components/auth/NewPasswordFields';
import { authClient, authErrorMessage } from '@/lib/auth-client';
import { newPasswordError } from '@/lib/password';

const IDS = { password: 'new-password', confirm: 'confirm-password' };

export function PasswordForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const invalid = newPasswordError(form, IDS);
    if (invalid) return setError(invalid);

    setPending(true);
    setError(null);
    setDone(false);
    const { error } = await authClient.changePassword({
      currentPassword: String(form.get('current-password') ?? ''),
      newPassword: String(form.get(IDS.password)),
      revokeOtherSessions: true,
    });
    setPending(false);
    if (error) return setError(authErrorMessage(error));
    formRef.current?.reset();
    setDone(true);
    router.refresh(); // the browser count below drops to 1
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Password</h2>
      <form ref={formRef} onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="current-password">Current password</Label>
          <Input id="current-password" name="current-password" type="password" required autoComplete="current-password" />
        </div>
        <NewPasswordFields ids={IDS} label="New password" />
        <FormError message={error} />
        {done && (
          <p role="status" className="rounded-ui bg-success-soft px-3 py-2 text-success">
            Password changed. Any other browsers you were signed in on are now signed out.
          </p>
        )}
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Changing…' : 'Change password'}
        </Button>
      </form>
    </Card>
  );
}
