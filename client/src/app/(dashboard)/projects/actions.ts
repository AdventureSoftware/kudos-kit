'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

export type ActionResult = { error?: string };

async function projectCall(path: string, method: 'POST' | 'PATCH', body: object): Promise<ActionResult> {
  const res = await apiFetch(path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 401) redirect('/login');
  if (res.status === 403) return { error: 'Only owners and admins can change projects.' };
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
    return { error: message || 'Something went wrong. Please try again.' };
  }
  // Other pages list projects too (Widget, the project filter on Feedback).
  revalidatePath('/', 'layout');
  return {};
}

export async function addProject(input: { key: string; name: string; prefix: string }): Promise<ActionResult> {
  return projectCall('/v1/projects', 'POST', input);
}

export async function renameProject(key: string, name: string): Promise<ActionResult> {
  return projectCall(`/v1/projects/${encodeURIComponent(key)}`, 'PATCH', { name });
}

export async function setProjectActive(key: string, active: boolean): Promise<ActionResult> {
  return projectCall(`/v1/projects/${encodeURIComponent(key)}`, 'PATCH', { active });
}
