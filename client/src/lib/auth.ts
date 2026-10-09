import 'server-only';
import { cookies } from 'next/headers';

export const TOKEN_COOKIE = 'admin_token';
export const API_URL = process.env.NESTJS_API_URL ?? 'http://localhost:3000';

export async function getToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(TOKEN_COOKIE)?.value ?? null;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API_URL}${path}`, { ...init, headers, cache: 'no-store' });
}
