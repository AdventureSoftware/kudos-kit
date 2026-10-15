'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import type { SessionUser } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { NAV_ITEMS, isActive } from './nav-items';
import { Avatar } from './Avatar';

/** Left sidebar from the md breakpoint up (768px). Phones get BottomTabs + MobileTopBar instead. */
export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const onAccount = pathname.startsWith('/account');

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-14 items-center px-5">
        <Link href="/" aria-label="Kudos Kit overview" className="flex items-center">
          <Logo size={26} />
        </Link>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-ui px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-muted hover:text-text',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/account"
          aria-current={onAccount ? 'page' : undefined}
          title="Your account"
          className={cn(
            'flex items-center gap-3 rounded-ui px-2 py-2 transition-colors',
            onAccount ? 'bg-accent-soft' : 'hover:bg-surface-muted',
          )}
        >
          <Avatar name={user.name} />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-medium text-text">{user.name}</span>
            <span className="block truncate text-xs text-muted">{user.email}</span>
          </span>
        </Link>
        <div className="mt-1">
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
