'use server'

import { createHmac, timingSafeEqual } from 'crypto';
import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/auth';

export async function loginAction(formData: FormData): Promise<void> {
  const password = formData.get('password');
  const expected = process.env.ADMIN_PASSWORD;
  if (typeof password !== 'string' || !expected) {
    redirect('/login?error=1');
  }
  const a = createHmac('sha256', 'kkw-pw-check').update(password).digest();
  const b = createHmac('sha256', 'kkw-pw-check').update(expected).digest();
  if (!timingSafeEqual(a, b)) {
    redirect('/login?error=1');
  }
  await createSession();
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
