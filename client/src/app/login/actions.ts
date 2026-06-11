'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const password = formData.get('password')?.toString() ?? '';

  const res = await fetch(`${API_URL}/v1/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    return { error: 'Invalid password' };
  }

  const { token } = (await res.json()) as { token: string };
  const jar = await cookies();
  jar.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  redirect('/admin');
}
