'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { authClient } from '@/lib/auth-client';


export function SignOutButton({ redirectTo = '/login', label = 'Sign out' }: { redirectTo?: string; label?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        router.replace(redirectTo);
        router.refresh();
      }}
    >
      {pending ? 'Signing out…' : label}
    </Button>
  );
}
