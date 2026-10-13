'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, FormError, Input, Label } from '@/components/ui';
import { authClient, authErrorMessage } from '@/lib/auth-client';
import { roleLabel } from '@/lib/team';

interface ProfileFormProps {
  name: string;
  email: string;
  role: string;
}


export function ProfileForm({ name, email, role }: ProfileFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const trimmed = value.trim();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const { error } = await authClient.updateUser({ name: trimmed });
    setPending(false);
    if (error) return setError(authErrorMessage(error));
    setSaved(true);
    router.refresh(); // the header shows the new name
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Profile</h2>
        <Badge tone={role === 'owner' ? 'accent' : 'neutral'}>{roleLabel(role)}</Badge>
      </div>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setSaved(false);
            }}
            required
            maxLength={100}
            autoComplete="name"
          />
        </div>
        <div>
          <Label htmlFor="account-email">Email</Label>
          <Input id="account-email" value={email} readOnly className="bg-surface-muted text-muted" />
          <p className="mt-1 text-xs text-muted">You sign in with this email. It can’t be changed here yet.</p>
        </div>
        <FormError message={error} />
        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" disabled={pending || !trimmed || trimmed === name}>
            {pending ? 'Saving…' : 'Save name'}
          </Button>
          {saved && <span role="status" className="text-sm text-success">Saved</span>}
        </div>
      </form>
    </Card>
  );
}
