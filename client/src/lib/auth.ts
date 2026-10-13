import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import type { SocialProvider } from './social';

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

export interface SetupStatus {
  needsSetup: boolean;
  emailEnabled: boolean;
  providers: SocialProvider[];
  retentionDays: number;
}


export const getSetupStatus = cache(async (): Promise<SetupStatus> => {
  const res = await fetch(`${API_URL}/v1/setup/status`, { cache: 'no-store' });
  if (!res.ok) return { needsSetup: false, emailEnabled: true, providers: [], retentionDays: 90 };
  const data = (await res.json()) as Partial<SetupStatus>;
  return {
    needsSetup: Boolean(data.needsSetup),
    emailEnabled: data.emailEnabled !== false,
    providers: (data.providers ?? []).filter((p): p is SocialProvider => p === 'google' || p === 'apple'),
    retentionDays: typeof data.retentionDays === 'number' ? data.retentionDays : 90,
  };
});

export async function needsSetup(): Promise<boolean> {
  return (await getSetupStatus()).needsSetup;
}

export interface InvitationInfo {
  email: string;
  role: string;
  inviterName: string;
  expiresAt: string;
  hasAccount: boolean;
}


export async function getInvitation(id: string): Promise<InvitationInfo | null> {
  const res = await fetch(`${API_URL}/v1/invitations/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()) as InvitationInfo;
}
