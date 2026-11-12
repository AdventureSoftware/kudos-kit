'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

export async function cycleStatus(id: string): Promise<void> {
  const res = await apiFetch(`/v1/admin/feedback/${encodeURIComponent(id)}/status`, { method: 'PATCH' });
  if (res.status === 401) redirect('/login');
  revalidatePath('/', 'layout');
}

export async function deleteFeedback(id: string): Promise<void> {
  const res = await apiFetch(`/v1/admin/feedback/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 401) redirect('/login');
  revalidatePath('/', 'layout');
}


export async function deleteFeedbackAndClose(id: string, closeHref: string): Promise<void> {
  const res = await apiFetch(`/v1/admin/feedback/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 401) redirect('/login');
  revalidatePath('/', 'layout');
  redirect(closeHref.startsWith('/feedback') ? closeHref : '/feedback');
}


export async function withdrawTestimonial(id: string): Promise<void> {
  const res = await apiFetch(`/v1/admin/feedback/${encodeURIComponent(id)}/testimonial/withdraw`, { method: 'PATCH' });
  if (res.status === 401) redirect('/login');
  revalidatePath('/', 'layout');
}
