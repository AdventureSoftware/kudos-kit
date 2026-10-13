import Link from 'next/link';
import type { SessionUser } from '@/lib/auth';
import { NavLinks } from './NavLinks';
import { Logo } from './Logo';
import { SignOutButton } from './auth/SignOutButton';

/** Top bar. On phones the menu moves to a second row so your name and Sign out stay visible. */
export function AppHeader({ user }: { user: SessionUser }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 px-4 sm:h-14 sm:flex-nowrap sm:px-6">
        <div className="flex h-14 items-center gap-6 sm:h-auto">
          <Link href="/" aria-label="Kudos Kit overview" className="flex shrink-0 items-center">
            <Logo size={26} />
          </Link>
          <div className="hidden sm:block">
            <NavLinks />
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/account"
            title="Your account"
            className="block min-w-0 rounded-ui px-2 py-1 text-right leading-tight hover:bg-surface-muted"
          >
            <span className="block truncate text-sm font-medium text-text">{user.name}</span>
            <span className="hidden truncate text-xs text-muted sm:block">{user.email}</span>
          </Link>
          <SignOutButton />
        </div>
        <div className="-mx-1 w-full overflow-x-auto pb-2 sm:hidden">
          <NavLinks />
        </div>
      </div>
    </header>
  );
}
