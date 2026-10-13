'use client';

import { useState, useTransition } from 'react';
import { Button, ConfirmDialog, MenuSelect } from '@/components/ui';
import { changeRole, removeMember } from '@/app/(dashboard)/team/actions';
import { ROLE_LABELS } from '@/lib/team';

type AssignableRole = 'admin' | 'member';

const OPTIONS: Array<{ value: AssignableRole; label: string }> = [
  { value: 'admin', label: ROLE_LABELS.admin },
  { value: 'member', label: ROLE_LABELS.member },
];

/** Owner only: switch someone between admin and member. */
export function RoleSelect({ memberId, role, name }: { memberId: string; role: AssignableRole; name: string }) {
  const [value, setValue] = useState(role);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div>
      <MenuSelect
        label={`Role of ${name}`}
        value={value}
        options={OPTIONS}
        className={pending ? 'opacity-60' : undefined}
        onChange={(next) => {
          setValue(next);
          setError(null);
          start(async () => {
            const result = await changeRole(memberId, next);
            if (result.error) {
              setValue(role);
              setError(result.error);
            }
          });
        }}
      />
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}


export function RemoveMemberButton({ memberId, name }: { memberId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <>
      <Button variant="danger" size="sm" disabled={pending} onClick={() => setOpen(true)}>
        {pending ? 'Removing…' : 'Remove'}
      </Button>
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
      <ConfirmDialog
        open={open}
        title={`Remove ${name}?`}
        message="Their account is deleted and they are signed out right away. You can invite them again later."
        confirmLabel="Remove"
        tone="danger"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          start(async () => setError((await removeMember(memberId)).error ?? null));
        }}
      />
    </>
  );
}
