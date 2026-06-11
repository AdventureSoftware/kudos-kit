import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/auth';
import { cycleStatus, deleteFeedback } from './actions';

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

interface PageProps {
  searchParams: Promise<{ project?: string; status?: string; page?: string }>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.project) qs.set('project', params.project);
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', params.page);

  const [feedbackRes, projectsRes] = await Promise.all([
    apiFetch(`/v1/admin/feedback?${qs}`),
    apiFetch('/v1/admin/projects'),
  ]);

  if (feedbackRes.status === 401 || projectsRes.status === 401) {
    redirect('/login');
  }

  const data: ListResponse = await feedbackRes.json();
  const projects: string[] = await projectsRes.json();

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Feedback Admin</h1>

      <form method="GET" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <select name="project" defaultValue={params.project ?? ''}>
          <option value="">All projects</option>
          {projects.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select name="status" defaultValue={params.status ?? ''}>
          <option value="">All statuses</option>
          <option value="new">new</option>
          <option value="triaged">triaged</option>
          <option value="done">done</option>
        </select>
        <button type="submit">Filter</button>
        <a href="/admin">Reset</a>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>ID</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Project</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Type</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Message</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Status</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Date</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map(row => (
            <tr key={row.id}>
              <td style={{ padding: '0.4rem 0.5rem' }}>{row.id}</td>
              <td style={{ padding: '0.4rem 0.5rem' }}>{row.project}</td>
              <td style={{ padding: '0.4rem 0.5rem' }}>{row.type}</td>
              <td style={{ padding: '0.4rem 0.5rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.message}</td>
              <td style={{ padding: '0.4rem 0.5rem' }}>{row.status}</td>
              <td style={{ padding: '0.4rem 0.5rem' }}>{new Date(row.created_at).toLocaleDateString()}</td>
              <td style={{ padding: '0.4rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
                <CycleStatusButton id={row.id} status={row.status} />
                <DeleteButton id={row.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span>Page {data.page} of {data.totalPages} ({data.total} total)</span>
        {data.page > 1 && (
          <a href={`/admin?${new URLSearchParams({ ...params, page: String(data.page - 1) })}`}>&#8592; Prev</a>
        )}
        {data.page < data.totalPages && (
          <a href={`/admin?${new URLSearchParams({ ...params, page: String(data.page + 1) })}`}>Next &#8594;</a>
        )}
      </div>
    </main>
  );
}

function CycleStatusButton({ id, status }: { id: string; status: string }) {
  const cycleWithId = cycleStatus.bind(null, id);
  return (
    <form action={cycleWithId} style={{ display: 'inline' }}>
      <button type="submit" style={{ cursor: 'pointer' }}>{status}</button>
    </form>
  );
}

function DeleteButton({ id }: { id: string }) {
  const deleteWithId = deleteFeedback.bind(null, id);
  return (
    <form action={deleteWithId} style={{ display: 'inline' }}>
      <button type="submit" style={{ cursor: 'pointer', color: 'red' }}>delete</button>
    </form>
  );
}
