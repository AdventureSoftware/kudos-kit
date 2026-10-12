import Link from 'next/link';
import { logoutAction } from '@/app/admin/actions';
import { Button } from './ui';

export function AppHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold text-text">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
          kudos-kit
        </Link>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm">Sign out</Button>
        </form>
      </div>
    </header>
  );
}
