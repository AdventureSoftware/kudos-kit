'use client';

import { useEffect, useState } from 'react';
import { Button, starText } from '@/components/ui';

/** ★★★★★ “Message” — Name, ready to paste on a website. */
export function formatQuote(message: string, name: string | null, rating: number | null = null): string {
  const stars = rating ? `${starText(rating)}\n` : '';
  return `${stars}“${message.trim()}”\n— ${name?.trim() || 'Anonymous'}`;
}

export function CopyQuoteButton({ message, name, rating = null }: { message: string; name: string | null; rating?: number | null }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <Button
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(formatQuote(message, name, rating));
        setCopied(true);
      }}
    >
      {copied ? 'Copied ✓' : 'Copy as quote'}
    </Button>
  );
}
