'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, FormError } from '@/components/ui';
import { authClient, authErrorMessage } from '@/lib/auth-client';

/** How many browsers are signed in to this account, with a way to sign out all but this one. */
export function SessionsCard({ count }: { count: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const others = Math.max(0, count - 1);

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Signed-in browsers</h2>
      <p className="mt-1 text-muted">
        {others === 0
          ? 'You are only signed in here.'
          : `You are signed in here and in ${others} other ${others === 1 ? 'browser' : 'browsers'}.`}{' '}
        A login lasts 7 days and is extended while you use it.
      </p>
      <FormError message={error} className="mt-3" />
      <Button
        className="mt-4"
        disabled={pending || others === 0}
        onClick={async () => {
          setPending(true);
          setError(null);
          const { error } = await authClient.revokeOtherSessions();
          setPending(false);
          if (error) return setError(authErrorMessage(error));
          router.refresh();
        }}
      >
        {pending ? 'Signing out…' : 'Sign out of the other browsers'}
      </Button>
    </Card>
  );
}
