import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/auth';
import { WidgetPlayground } from '@/components/widget/WidgetPlayground';
import type { WidgetProject } from '@/components/widget/types';

export const metadata = { title: 'Widget' };

/** Cloudflare's test key: always passes. Only for local development. */
const TURNSTILE_TEST_KEY = '1x00000000000000000000AA';

export default async function WidgetPage() {
  const res = await apiFetch('/v1/admin/widget/projects');
  if (res.status === 401) redirect('/login');
  if (!res.ok) throw new Error(`API error: widget projects ${res.status}`);
  const projects = (await res.json()) as WidgetProject[];
  // Public value (it ends up in every site's HTML). Set it in client/.env.local.
  const siteKey = process.env.TURNSTILE_SITE_KEY?.trim() || TURNSTILE_TEST_KEY;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Widget</h1>
        <p className="text-muted">The feedback button you add to your apps and websites. Try it here, then copy the code.</p>
      </div>
      {siteKey === TURNSTILE_TEST_KEY && (
        <p className="rounded-ui bg-warning-soft px-3 py-2 text-warning">
          Using Cloudflare’s test key for the spam check, which lets everything through. Before going live, set{' '}
          <code className="font-mono text-xs">TURNSTILE_SITE_KEY</code> in client/.env.local and the matching{' '}
          <code className="font-mono text-xs">TURNSTILE_SECRET</code> in server/.env.
        </p>
      )}
      <WidgetPlayground projects={projects} turnstileSiteKey={siteKey} />
    </div>
  );
}
