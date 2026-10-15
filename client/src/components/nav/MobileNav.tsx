'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import type { SessionUser } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { NAV_ITEMS, isActive } from './nav-items';
import { Avatar } from './Avatar';

/** Phones only: logo + account in a slim top bar. Sign out lives on the Account page. */
export function MobileTopBar({ user }: { user: SessionUser }) {
  const onAccount = usePathname().startsWith('/account');
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur md:hidden">
      <Link href="/" aria-label="Kudos Kit overview" className="flex items-center">
        <Logo size={24} />
      </Link>
      <Link
        href="/account"
        aria-label={`Your account (${user.name})`}
        aria-current={onAccount ? 'page' : undefined}
        className={cn('rounded-full p-0.5', onAccount && 'ring-2 ring-accent')}
      >
        <Avatar name={user.name} />
      </Link>
    </header>
  );
}

/** Phones only: the four pages as tabs fixed to the bottom of the screen. */
export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
                  active ? 'text-accent' : 'text-muted hover:text-text',
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
