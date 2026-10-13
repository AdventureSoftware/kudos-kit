'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

export type ActionResult = { error?: string };

async function teamCall(path: string, init: RequestInit): Promise<ActionResult> {
  const res = await apiFetch(path, init);
  if (res.status === 401) redirect('/login');
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(body?.message) ? body.message.join(' ') : body?.message;
    return { error: message || 'Something went wrong. Please try again.' };
  }
  revalidatePath('/team');
  return {};
}

/** Removes the person from the team and deletes their account. */
export async function removeMember(memberId: string): Promise<ActionResult> {
  return teamCall(`/v1/team/members/${encodeURIComponent(memberId)}`, { method: 'DELETE' });
}

export async function changeRole(memberId: string, role: 'admin' | 'member'): Promise<ActionResult> {
  return teamCall(`/v1/team/members/${encodeURIComponent(memberId)}/role`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role }),
  });
}
