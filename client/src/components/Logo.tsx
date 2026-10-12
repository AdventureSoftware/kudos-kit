import { cn } from '@/lib/cn';

export const LOGO_BUBBLE =
  'M14 8h36a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H26l-12 9v-9a10 10 0 0 1-10-10V18A10 10 0 0 1 14 8z';
export const LOGO_SPARKLE =
  'M32 16c1.2 6.6 3.4 8.8 10 10-6.6 1.2-8.8 3.4-10 10-1.2-6.6-3.4-8.8-10-10 6.6-1.2 8.8-3.4 10-10z';

interface LogoMarkProps {

  size?: number;
  className?: string;
  title?: string;
}

export function LogoMark({ size = 24, className, title }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d={LOGO_BUBBLE} className="fill-brand" />
      <path d={LOGO_SPARKLE} fill="#fff" />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 24, className }: LogoProps) {
  return (
    <span
      className={cn('inline-flex items-center font-semibold tracking-tight text-text', className)}
      style={{ gap: Math.round(size * 0.35), fontSize: Math.round(size * 0.66) }}
    >
      <LogoMark size={size} />
      <span>Kudos Kit</span>
    </span>
  );
}
