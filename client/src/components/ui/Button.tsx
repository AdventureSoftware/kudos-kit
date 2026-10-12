import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerSolid';
type Size = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-1.5 rounded-ui font-medium transition-colors ' +
  'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-contrast hover:bg-accent-hover',
  secondary: 'bg-surface text-text border border-border hover:bg-surface-muted',
  ghost: 'text-muted hover:text-text hover:bg-surface-muted',
  danger: 'text-danger hover:bg-danger-soft',
  dangerSolid: 'bg-danger text-danger-contrast hover:opacity-90',
};

const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs',
  md: 'h-9 px-3.5 text-sm',
};

export function buttonClass(variant: Variant = 'secondary', size: Size = 'md', extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, ...rest }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...rest} />;
}
