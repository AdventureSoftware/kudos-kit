import { cn } from '@/lib/cn';

const control =
  'h-9 rounded-ui border border-border bg-surface px-3 text-sm text-text ' +
  'placeholder:text-muted focus:border-accent focus:outline-none';

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, 'w-full', className)} {...rest} />;
}

export function Select({ className, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, 'pr-8', className)} {...rest} />;
}

export function Label({ className, ...rest }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-1.5 block text-xs font-medium text-muted', className)} {...rest} />;
}
