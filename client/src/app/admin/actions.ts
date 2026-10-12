'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

export async function cycleStatus(id: string): Promise<void> {
  const res = await apiFetch(`/v1/admin/feedback/${encodeURIComponent(id)}/status`, { method: 'PATCH' });
  if (res.status === 401) redirect('/login');
  revalidatePath('/admin', 'layout');
}

export async function deleteFeedback(id: string): Promise<void> {
  const res = await apiFetch(`/v1/admin/feedback/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 401) redirect('/login');
  revalidatePath('/admin', 'layout');
}

/** Delete from the detail panel, then return to the list with the same filters. */
export async function deleteFeedbackAndClose(id: string, closeHref: string): Promise<void> {
  const res = await apiFetch(`/v1/admin/feedback/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 401) redirect('/login');
  revalidatePath('/admin', 'layout');
  // Only ever redirect inside the feedback list.
  redirect(closeHref.startsWith('/admin/feedback') ? closeHref : '/admin/feedback');
}
