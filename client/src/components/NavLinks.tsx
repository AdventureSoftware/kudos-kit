'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const links = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/feedback', label: 'Feedback', exact: false },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1" aria-label="Main">
      {links.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-ui px-3 py-1.5 text-sm font-medium transition-colors',
              active ? 'bg-surface-muted text-text' : 'text-muted hover:text-text',
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
