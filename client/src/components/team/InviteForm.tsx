'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, FormError, Input, Label, MenuSelect } from '@/components/ui';
import { authClient, authErrorMessage } from '@/lib/auth-client';
import { ROLE_HINTS, ROLE_LABELS } from '@/lib/team';

type InviteRole = 'member' | 'admin';

const ROLE_OPTIONS: Array<{ value: InviteRole; label: string }> = [
  { value: 'member', label: ROLE_LABELS.member },
  { value: 'admin', label: ROLE_LABELS.admin },
];

/** Owners and admins invite people by email. The link works for 7 days. */
export function InviteForm({ emailEnabled }: { emailEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('member');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const to = email.trim();
    setPending(true);
    setError(null);
    setSentTo(null);
    const { error } = await authClient.organization.inviteMember({ email: to, role });
    setPending(false);
    if (error) return setError(authErrorMessage(error));
    setSentTo(to);
    setEmail('');
    setRole('member');
    router.refresh();
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Invite someone</h2>
      <p className="mt-1 text-muted">
        {emailEnabled
          ? 'They get an email with a link to create their account. The link works for 7 days.'
          : 'Email isn’t set up on this server, so you’ll copy the invite link and send it yourself. It works for 7 days.'}
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-2">
        <div className="min-w-56 flex-1">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            autoComplete="off"
          />
        </div>
        <div>
          <span aria-hidden className="mb-1.5 block text-xs font-medium text-muted">Role</span>
          <MenuSelect label="Role" value={role} options={ROLE_OPTIONS} onChange={setRole} />
        </div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Sending…' : emailEnabled ? 'Send invite' : 'Create invite'}
        </Button>
      </form>
      <p className="mt-2 text-xs text-muted">{ROLE_LABELS[role]}: {ROLE_HINTS[role]}</p>

      <FormError message={error} className="mt-3" />
      {sentTo && (
        <p role="status" className="mt-3 rounded-ui bg-success-soft px-3 py-2 text-success">
          {emailEnabled
            ? `Invitation emailed to ${sentTo}.`
            : `Invitation created for ${sentTo}. Use “Copy link” below and send it to them.`}
        </p>
      )}
    </Card>
  );
}
