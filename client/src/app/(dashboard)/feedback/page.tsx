import { redirect } from 'next/navigation';
import { apiFetch, getMemberRole } from '@/lib/auth';
import { feedbackHref, isFiltered, parseFeedbackQuery, toApiParams } from '@/lib/feedback-query';
import { FeedbackToolbar } from '@/components/feedback/FeedbackToolbar';
import { FeedbackTable } from '@/components/feedback/FeedbackTable';
import { FeedbackDrawer, type FeedbackDetail } from '@/components/feedback/FeedbackDrawer';
import type { FeedbackListResponse } from '@/components/feedback/types';

export const metadata = { title: 'Feedback' };

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseFeedbackQuery(await searchParams);

  const [listRes, projectsRes, itemRes, role] = await Promise.all([
    apiFetch(`/v1/admin/feedback?${toApiParams(query)}`),
    apiFetch('/v1/admin/projects'),
    query.item ? apiFetch(`/v1/admin/feedback/${query.item}`) : Promise.resolve(null),
    getMemberRole(),
  ]);
  // Deleting is permanent (GDPR erasure), so only owners and admins see the button.
  const canDelete = role === 'owner' || role === 'admin';
  if ([listRes, projectsRes, itemRes].some((r) => r?.status === 401)) redirect('/login');
  if (!listRes.ok || !projectsRes.ok) {
    throw new Error(`API error: feedback ${listRes.status}, projects ${projectsRes.status}`);
  }

  const data: FeedbackListResponse = await listRes.json();
  const projects: string[] = await projectsRes.json();
  const item: FeedbackDetail | null = itemRes?.ok ? await itemRes.json() : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Feedback</h1>
        <p className="text-muted">
          {data.total} {data.total === 1 ? 'item' : 'items'}{isFiltered(query) && ' matching'}
        </p>
      </div>

      <FeedbackToolbar query={query} projects={projects} counts={data.statusCounts} />

      <FeedbackTable data={data} query={query} canDelete={canDelete} />

      {query.item && <FeedbackDrawer item={item} closeHref={feedbackHref(query, { item: undefined })} canDelete={canDelete} />}
    </div>
  );
}
