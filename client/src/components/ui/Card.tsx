import { cn } from '@/lib/cn';

export function Card({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-ui border border-border bg-surface shadow-[var(--card-shadow)]', className)} {...rest} />;
}
