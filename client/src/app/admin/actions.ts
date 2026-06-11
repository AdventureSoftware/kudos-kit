'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

export async function cycleStatus(id: string): Promise<void> {
  const res = await apiFetch(`/v1/admin/feedback/${id}/status`, { method: 'PATCH' });
  if (res.status === 401) redirect('/login');
  revalidatePath('/admin');
}

export async function deleteFeedback(id: string): Promise<void> {
  const res = await apiFetch(`/v1/admin/feedback/${id}`, { method: 'DELETE' });
  if (res.status === 401) redirect('/login');
  revalidatePath('/admin');
}
