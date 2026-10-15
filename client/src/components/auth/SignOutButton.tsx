'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ConfirmDialog } from '@/components/ui';
import { authClient } from '@/lib/auth-client';

interface SignOutButtonProps {
  redirectTo?: string;
  label?: string;
  confirm?: boolean;
}

export function SignOutButton({ redirectTo = '/login', label = 'Sign out', confirm = true }: SignOutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [asking, setAsking] = useState(false);

  async function signOut() {
    setAsking(false);
    setPending(true);
    await authClient.signOut();
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => (confirm ? setAsking(true) : void signOut())}
      >
        {pending ? 'Signing out…' : label}
      </Button>
      {confirm && (
        <ConfirmDialog
          open={asking}
          title="Sign out?"
          message="You’ll need to sign in again to see the feedback inbox."
          confirmLabel="Sign out"
          onCancel={() => setAsking(false)}
          onConfirm={() => void signOut()}
        />
      )}
    </>
  );
}
