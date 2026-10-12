import Link from 'next/link';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/auth';
import { cycleStatus, deleteFeedback } from './actions';
import {
  Badge, Button, Card, ConfirmButton, EmptyState, Pagination, Select,
  Table, Td, Th, Tr, buttonClass, statusTone, typeTone,
} from '@/components/ui';

interface FeedbackRow {
  id: string;
  project: string;
  type: string;
  message: string;
  email: string | null;
  status: string;
  created_at: string;
}

interface ListResponse {
  rows: FeedbackRow[];
  total: number;
  page: number;
  totalPages: number;
}

type Params = { project?: string; status?: string; page?: string };

const NEXT_STATUS: Record<string, string> = { new: 'triaged', triaged: 'done', done: 'new' };

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
});

export default async function AdminPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.project) qs.set('project', params.project);
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', params.page);

  const [feedbackRes, projectsRes] = await Promise.all([
    apiFetch(`/v1/admin/feedback?${qs}`),
    apiFetch('/v1/admin/projects'),
  ]);

  if (feedbackRes.status === 401 || projectsRes.status === 401) redirect('/login');
  if (!feedbackRes.ok || !projectsRes.ok) {
    throw new Error(`API error: feedback ${feedbackRes.status}, projects ${projectsRes.status}`);
  }

  const data: ListResponse = await feedbackRes.json();
  const projects: string[] = await projectsRes.json();
  const filtered = Boolean(params.project || params.status);

  const hrefFor = (page: number) => {
    const next = new URLSearchParams(qs);
    next.set('page', String(page));
    return `/admin?${next}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Feedback</h1>
          <p className="text-muted">{data.total} {data.total === 1 ? 'item' : 'items'}{filtered && ' matching filters'}</p>
        </div>

        <form method="GET" className="flex flex-wrap items-center gap-2">
          <Select name="project" defaultValue={params.project ?? ''} aria-label="Project">
            <option value="">All projects</option>
            {projects.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Select name="status" defaultValue={params.status ?? ''} aria-label="Status">
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="triaged">Triaged</option>
            <option value="done">Done</option>
          </Select>
          <Button type="submit" variant="primary">Filter</Button>
          {filtered && <Link href="/admin" className={buttonClass('ghost')}>Reset</Link>}
        </form>
      </div>

      <Card>
        {data.rows.length === 0 ? (
          <EmptyState
            title={filtered ? 'Nothing matches these filters' : 'No feedback yet'}
            hint={filtered ? 'Try another project or status.' : 'Submissions from the widget will appear here.'}
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th className="w-16">ID</Th>
                  <Th>Project</Th>
                  <Th>Type</Th>
                  <Th className="w-full">Message</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th><span className="sr-only">Actions</span></Th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <Tr key={row.id}>
                    <Td className="font-mono text-xs text-muted">{row.id}</Td>
                    <Td className="whitespace-nowrap">{row.project}</Td>
                    <Td><Badge tone={typeTone[row.type] ?? 'neutral'}>{row.type}</Badge></Td>
                    <Td className="max-w-0">
                      <p className="truncate" title={row.message}>{row.message}</p>
                      {row.email && <p className="truncate text-xs text-muted">{row.email}</p>}
                    </Td>
                    <Td><StatusButton id={row.id} status={row.status} /></Td>
                    <Td className="whitespace-nowrap text-muted">{dateFmt.format(new Date(row.created_at))}</Td>
                    <Td className="text-right"><DeleteButton id={row.id} /></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={data.page} totalPages={data.totalPages} total={data.total} hrefFor={hrefFor} />
          </>
        )}
      </Card>
    </div>
  );
}

function StatusButton({ id, status }: { id: string; status: string }) {
  return (
    <form action={cycleStatus.bind(null, id)}>
      <button
        type="submit"
        className="cursor-pointer rounded-full hover:opacity-80"
        title={`Mark as ${NEXT_STATUS[status] ?? 'new'}`}
      >
        <Badge tone={statusTone[status] ?? 'neutral'}>{status}</Badge>
      </button>
    </form>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteFeedback.bind(null, id)}>
      <ConfirmButton variant="danger" size="sm" message={`Delete feedback #${id}? This cannot be undone.`}>
        Delete
      </ConfirmButton>
    </form>
  );
}
