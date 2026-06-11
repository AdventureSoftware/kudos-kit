'use server'

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { logoutAction } from '../login/actions';

export { logoutAction };

const STATUS_CYCLE = { new: 'triaged', triaged: 'done', done: 'new' } as const;

export async function toggleStatusAction(id: string): Promise<void> {
  const result = await query<{ status: 'new' | 'triaged' | 'done' }>(
    'SELECT status FROM feedback WHERE id = $1',
    [id],
  );
  const current = result.rows[0]?.status;
  if (!current) return;
  const next = STATUS_CYCLE[current];
  await query('UPDATE feedback SET status = $1 WHERE id = $2', [next, id]);
  revalidatePath('/admin');
}

export async function deleteRowAction(id: string): Promise<void> {
  await query('DELETE FROM feedback WHERE id = $1', [id]);
  revalidatePath('/admin');
}
