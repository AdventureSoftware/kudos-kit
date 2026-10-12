'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_URL, TOKEN_COOKIE } from '@/lib/auth';

export async function loginAction(formData: FormData): Promise<void> {
  const password = formData.get('password')?.toString() ?? '';

  const res = await fetch(`${API_URL}/v1/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  // 429 = too many attempts (login is throttled on the server)
  if (res.status === 429) redirect('/login?error=throttled');
  if (!res.ok) redirect('/login?error=invalid');

  const { token } = (await res.json()) as { token: string };
  const jar = await cookies();
  jar.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  redirect('/admin');
}
