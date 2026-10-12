'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch, TOKEN_COOKIE } from '@/lib/auth';

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


export async function deleteFeedbackAndClose(id: string, closeHref: string): Promise<void> {
  const res = await apiFetch(`/v1/admin/feedback/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 401) redirect('/login');
  revalidatePath('/admin', 'layout');
  redirect(closeHref.startsWith('/admin/feedback') ? closeHref : '/admin/feedback');
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  jar.delete(TOKEN_COOKIE);
  redirect('/login');
}
