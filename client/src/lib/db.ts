import { Pool, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function query<T extends QueryResultRow = any>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
  return getPool().query<T>(sql, params);
}

export interface FeedbackRow {
  id: string;
  project: string;
  type: 'bug' | 'idea' | 'other';
  message: string;
  email: string | null;
  user_ctx: Record<string, unknown> | null;
  context: Record<string, unknown> | null;
  console_logs: Array<{ t: number; level: string; msg: string }> | null;
  errors: Array<{ message: string; stack?: string; filename?: string; lineno?: number }> | null;
  status: 'new' | 'triaged' | 'done';
  ip: string | null;
  created_at: string;
}
