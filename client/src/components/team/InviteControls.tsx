'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { authClient, authErrorMessage } from '@/lib/auth-client';


export function CopyLinkButton({ invitationId }: { invitationId: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        const link = `${window.location.origin}/invite/${invitationId}`;
        try {
          await navigator.clipboard.writeText(link);
          setCopied(true);
        } catch {
          window.prompt('Copy this invite link:', link);
        }
      }}
    >
      {copied ? 'Copied ✓' : 'Copy link'}
    </Button>
  );
}

export function CancelInviteButton({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          const { error } = await authClient.organization.cancelInvitation({ invitationId });
          if (error) {
            setError(authErrorMessage(error));
            setPending(false);
            return;
          }
          router.refresh();
        }}
      >
        {pending ? 'Cancelling…' : 'Cancel'}
      </Button>
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </>
  );
}
