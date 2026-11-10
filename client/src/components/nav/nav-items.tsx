/** Dashboard pages shown in the sidebar (desktop) and the bottom tab bar (phones). */

export interface NavItem {
  href: string;
  label: string;
  exact: boolean;
  icon: React.ReactNode;
}

const icon = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0" aria-hidden>
    {d}
  </svg>
);

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'Overview',
    exact: true,
    icon: icon(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>),
  },
  {
    href: '/feedback',
    label: 'Feedback',
    exact: false,
    icon: icon(<><path d="M4 13h4l1.5 3h5L16 13h4" /><path d="M5.5 5h13l1.5 8v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z" /></>),
  },
  {
    href: '/team',
    label: 'Team',
    exact: false,
    icon: icon(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18.5 14.5A6.5 6.5 0 0 1 21.5 20" /></>),
  },
  {
    href: '/projects',
    label: 'Projects',
    exact: false,
    icon: icon(<><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" /><path d="M3 11h18" /></>),
  },
  {
    href: '/widget',
    label: 'Widget',
    exact: false,
    icon: icon(<><path d="m8 8-4 4 4 4" /><path d="m16 8 4 4-4 4" /><path d="m13.5 5-3 14" /></>),
  },
];

export function isActive(pathname: string, item: Pick<NavItem, 'href' | 'exact'>): boolean {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}
