import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';

export const API_URL = process.env.NESTJS_API_URL ?? 'http://localhost:3000';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}


async function cookieHeader(): Promise<string> {
  return (await headers()).get('cookie') ?? '';
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const h = new Headers(init.headers);
  const cookie = await cookieHeader();
  if (cookie) h.set('cookie', cookie);
  return fetch(`${API_URL}${path}`, { ...init, headers: h, cache: 'no-store' });
}


export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const res = await apiFetch('/api/auth/get-session');
  if (!res.ok) return null;
  const data = (await res.json()) as { user?: SessionUser } | null;
  return data?.user ?? null;
});

export const getMemberRole = cache(async (): Promise<string | null> => {
  const res = await apiFetch('/api/auth/organization/get-active-member');
  if (!res.ok) return null;
  const data = (await res.json()) as { role?: string } | null;
  return data?.role ?? null;
});

export async function needsSetup(): Promise<boolean> {
  const res = await fetch(`${API_URL}/v1/setup/status`, { cache: 'no-store' });
  if (!res.ok) return false;
  return ((await res.json()) as { needsSetup: boolean }).needsSetup;
}
