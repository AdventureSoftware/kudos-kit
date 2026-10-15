import { cn } from '@/lib/cn';

export type Tone = 'neutral' | 'accent' | 'danger' | 'warning' | 'success';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-muted text-muted',
  accent: 'bg-accent-soft text-accent',
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success-soft text-success',
};

export function Badge({ tone = 'neutral', children, className, title }: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span title={title} className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}

/** Feedback type → color. */
export const typeTone: Record<string, Tone> = { bug: 'danger', idea: 'accent', praise: 'success', other: 'neutral' };

/** Feedback status → color. */
export const statusTone: Record<string, Tone> = { new: 'accent', triaged: 'warning', done: 'success' };
