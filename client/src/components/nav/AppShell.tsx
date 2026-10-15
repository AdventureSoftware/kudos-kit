import type { SessionUser } from '@/lib/auth';
import { Sidebar } from './Sidebar';
import { BottomTabs, MobileTopBar } from './MobileNav';

/**
 * Dashboard frame.
 * md and up (≥768px): sidebar on the left, page on the right.
 * Phones: slim top bar (logo + account) and a bottom tab bar; extra bottom padding keeps
 * the last row of each page above the tabs.
 */
export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar user={user} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-8 lg:px-8">
          {children}
        </main>
      </div>
      <BottomTabs />
    </div>
  );
}
