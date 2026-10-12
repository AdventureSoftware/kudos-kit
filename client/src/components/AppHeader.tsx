import Link from 'next/link';
import type { SessionUser } from '@/lib/auth';
import { NavLinks } from './NavLinks';
import { Logo } from './Logo';
import { SignOutButton } from './auth/SignOutButton';

export function AppHeader({ user }: { user: SessionUser }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/admin" aria-label="Kudos Kit overview" className="flex items-center">
            <Logo size={26} />
          </Link>
          <NavLinks />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-right leading-tight sm:block">
            <span className="block text-sm font-medium text-text">{user.name}</span>
            <span className="block text-xs text-muted">{user.email}</span>
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
