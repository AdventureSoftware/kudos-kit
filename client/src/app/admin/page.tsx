import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/auth';
import { Card } from '@/components/ui';
import { ProjectSwitcher } from '@/components/ProjectSwitcher';
import { StatCard, TrendDetail } from '@/components/dashboard/StatCard';
import { DailyChart } from '@/components/dashboard/DailyChart';
import { Breakdown } from '@/components/dashboard/Breakdown';

export const metadata = { title: 'Overview' };

interface Stats {
  total: number;
  byStatus: { new: number; triaged: number; done: number };
  byType: { bug: number; idea: number; other: number };
  byProject: Array<{ project: string; total: number; new: number }>;
  last7: number;
  prev7: number;
  daily: Array<{ date: string; count: number }>;
}

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project } = await searchParams;
  const qs = project ? `?project=${encodeURIComponent(project)}` : '';

  const [statsRes, projectsRes] = await Promise.all([
    apiFetch(`/v1/admin/stats${qs}`),
    apiFetch('/v1/admin/projects'),
  ]);
  if (statsRes.status === 401 || projectsRes.status === 401) redirect('/login');
  if (!statsRes.ok || !projectsRes.ok) {
    throw new Error(`API error: stats ${statsRes.status}, projects ${projectsRes.status}`);
  }

  const s: Stats = await statsRes.json();
  const projects: string[] = await projectsRes.json();

  /** Link to the feedback list, keeping the current project filter. */
  const listHref = (extra: Record<string, string> = {}) => {
    const p = new URLSearchParams({ ...(project ? { project } : {}), ...extra });
    const q = p.toString();
    return `/admin/feedback${q ? `?${q}` : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Overview</h1>
          <p className="text-muted">{project ? `Project: ${project}` : projects.length > 1 ? 'All projects' : projects[0] ?? 'No projects yet'}</p>
        </div>
        <ProjectSwitcher projects={projects} value={project} basePath="/admin" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Needs triage"
          value={s.byStatus.new}
          detail="Status: new"
          href={listHref({ status: 'new' })}
          emphasis
        />
        <StatCard
          label="Last 7 days"
          value={s.last7}
          detail={<TrendDetail current={s.last7} previous={s.prev7} />}
        />
        <StatCard
          label="Bug reports"
          value={s.byType.bug}
          detail={`of ${s.total} total`}
        />
        <StatCard
          label="Done"
          value={s.byStatus.done}
          detail={`${s.byStatus.triaged} triaged, waiting`}
          href={listHref({ status: 'done' })}
        />
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-semibold">Feedback per day</h2>
          <span className="text-xs text-muted">Last 14 days</span>
        </div>
        <DailyChart data={s.daily} />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">By type</h2>
          <Breakdown
            total={s.total}
            rows={[
              { label: 'Bug', value: s.byType.bug },
              { label: 'Idea', value: s.byType.idea },
              { label: 'Other', value: s.byType.other },
            ]}
          />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">By project</h2>
          <Breakdown
            total={s.total}
            rows={s.byProject.map((p) => ({
              label: p.project,
              value: p.total,
              note: p.new > 0 ? `${p.new} new` : undefined,
              href: `/admin/feedback?project=${encodeURIComponent(p.project)}`,
            }))}
          />
        </Card>
      </div>
    </div>
  );
}
