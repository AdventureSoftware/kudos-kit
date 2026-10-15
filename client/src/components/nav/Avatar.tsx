import { cn } from '@/lib/cn';

/** Round initial of the user's name, in the brand colour. */
export function Avatar({ name, className }: { name: string; className?: string }) {
  const initial = (name.trim()[0] ?? '?').toUpperCase();
  return (
    <span
      aria-hidden
      className={cn('flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white', className)}
    >
      {initial}
    </span>
  );
}
