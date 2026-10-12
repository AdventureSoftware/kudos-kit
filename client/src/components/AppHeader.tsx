import Link from 'next/link';
import { logoutAction } from '@/app/admin/actions';
import { Button } from './ui';
import { NavLinks } from './NavLinks';
import { Logo } from './Logo';

export function AppHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/admin" aria-label="Kudos Kit overview" className="flex items-center">
            <Logo size={26} />
          </Link>
          <NavLinks />
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm">Sign out</Button>
        </form>
      </div>
    </header>
  );
}
