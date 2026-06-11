import { query, FeedbackRow } from '@/lib/db';
import { toggleStatusAction, deleteRowAction, logoutAction } from './actions';

const PAGE_SIZE = 25;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const project = params.project ?? '';
  const status = params.status ?? '';
  const page = parseInt(params.page ?? '1', 10);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions: string[] = [];
  const values: unknown[] = [];
  if (project) { conditions.push(`project = $${values.length + 1}`); values.push(project); }
  if (status) { conditions.push(`status = $${values.length + 1}`); values.push(status); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rowsResult, countResult, projectsResult] = await Promise.all([
    query<FeedbackRow>(
      `SELECT * FROM feedback ${where} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
      values,
    ),
    query<{ count: string }>(`SELECT COUNT(*)::text as count FROM feedback ${where}`, values),
    query<{ key: string }>('SELECT key FROM projects ORDER BY key'),
  ]);

  const rows = rowsResult.rows;
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const projects = projectsResult.rows.map(r => r.key);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Feedback</h1>
        <form action={logoutAction}>
          <button type="submit" style={{ fontSize: 13, padding: '5px 12px', cursor: 'pointer' }}>Sign out</button>
        </form>
      </div>

      {/* Filters */}
      <form style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select name="project" defaultValue={project} style={{ padding: '6px 10px', fontSize: 13, borderRadius: 4, border: '1px solid #e5e5e5' }}>
          <option value="">All projects</option>
          {projects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select name="status" defaultValue={status} style={{ padding: '6px 10px', fontSize: 13, borderRadius: 4, border: '1px solid #e5e5e5' }}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="triaged">Triaged</option>
          <option value="done">Done</option>
        </select>
        <button type="submit" style={{ padding: '6px 14px', fontSize: 13, background: '#111', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Filter</button>
      </form>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e5e5', textAlign: 'left' }}>
            <th style={{ padding: '8px 12px' }}>Type</th>
            <th style={{ padding: '8px 12px' }}>Project</th>
            <th style={{ padding: '8px 12px' }}>Message</th>
            <th style={{ padding: '8px 12px' }}>Status</th>
            <th style={{ padding: '8px 12px' }}>Created</th>
            <th style={{ padding: '8px 12px' }}>URL</th>
            <th style={{ padding: '8px 12px' }}>Build</th>
            <th style={{ padding: '8px 12px' }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '8px 12px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: row.type === 'bug' ? '#fee2e2' : row.type === 'idea' ? '#dbeafe' : '#f3f4f6',
                  color: row.type === 'bug' ? '#991b1b' : row.type === 'idea' ? '#1d4ed8' : '#374151',
                }}>
                  {row.type}
                </span>
              </td>
              <td style={{ padding: '8px 12px', color: '#666' }}>{row.project}</td>
              <td style={{ padding: '8px 12px', maxWidth: 300 }}>
                <span title={row.message}>{row.message.slice(0, 80)}{row.message.length > 80 ? '…' : ''}</span>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <form action={toggleStatusAction.bind(null, row.id, row.status)}>
                  <button type="submit" style={{
                    padding: '2px 8px', fontSize: 11, borderRadius: 4, cursor: 'pointer', border: '1px solid #ccc',
                    background: row.status === 'new' ? '#fef9c3' : row.status === 'triaged' ? '#dbeafe' : '#dcfce7',
                  }}>
                    {row.status}
                  </button>
                </form>
              </td>
              <td style={{ padding: '8px 12px', color: '#666', whiteSpace: 'nowrap' }}>
                {new Date(row.created_at).toLocaleDateString()}
              </td>
              <td style={{ padding: '8px 12px', maxWidth: 160 }}>
                <span title={(row.context as any)?.url} style={{ color: '#666', fontSize: 12 }}>
                  {String((row.context as any)?.url ?? '').slice(0, 40)}
                </span>
              </td>
              <td style={{ padding: '8px 12px', color: '#666', fontSize: 12 }}>
                {String((row.context as any)?.build ?? '')}
              </td>
              <td style={{ padding: '8px 12px' }}>
                <form action={deleteRowAction.bind(null, row.id)}>
                  <button type="submit" style={{ fontSize: 12, padding: '3px 8px', cursor: 'pointer', color: '#c00', border: '1px solid #fca5a5', borderRadius: 4, background: '#fff' }}>
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#999' }}>No feedback yet</td></tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a
              key={p}
              href={`/admin?${new URLSearchParams({ ...(project && { project }), ...(status && { status }), page: String(p) })}`}
              style={{
                padding: '4px 10px', fontSize: 13, borderRadius: 4, border: '1px solid #e5e5e5',
                background: p === page ? '#111' : '#fff', color: p === page ? '#fff' : '#111', textDecoration: 'none',
              }}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
