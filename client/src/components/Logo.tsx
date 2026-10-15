import { cn } from '@/lib/cn';

/** Round speech bubble with a tail at the bottom left (64×64 grid). */
export const LOGO_BUBBLE = 'M32 6a24 24 0 1 1-12.6 44.4L8 56l4.6-11.6A24 24 0 0 1 32 6z';
/** Right eye: a sparkle, the "kudos" moment. */
export const LOGO_STAR =
  'M39 18c.7 3.8 2 5.1 5.8 5.8-3.8.7-5.1 2-5.8 5.8-.7-3.8-2-5.1-5.8-5.8 3.8-.7 5.1-2 5.8-5.8z';
export const LOGO_SMILE = 'M23 33q9 9 18 0';
/** Left eye (circle). */
export const LOGO_EYE = { cx: 25, cy: 24, r: 3.2 };

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
      <circle {...LOGO_EYE} fill="#fff" />
      <path d={LOGO_STAR} fill="#fff" />
      <path d={LOGO_SMILE} stroke="#fff" strokeWidth={4.5} strokeLinecap="round" />
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
      className={cn('inline-flex items-center font-extrabold tracking-tight text-text', className)}
      style={{ gap: Math.round(size * 0.35), fontSize: Math.round(size * 0.66) }}
    >
      <LogoMark size={size} />
      <span>Kudos Kit</span>
    </span>
  );
}
