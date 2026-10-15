import { cn } from '@/lib/cn';

/** Read-only 1–5 stars, e.g. ★★★★☆, with a text alternative for screen readers. */
export function Stars({ value, className }: { value: number; className?: string }) {
  const n = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span role="img" aria-label={`${n} of 5 stars`} title={`${n} of 5`} className={cn('whitespace-nowrap tracking-tight', className)}>
      <span aria-hidden className="text-amber-500">{'★'.repeat(n)}</span>
      <span aria-hidden className="text-border">{'★'.repeat(5 - n)}</span>
    </span>
  );
}

/** Plain-text stars for copying, e.g. "★★★★☆". */
export const starText = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);
