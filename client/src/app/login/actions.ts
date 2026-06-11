'use server'

import { timingSafeEqual } from 'crypto';
import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/auth';

export async function loginAction(formData: FormData): Promise<void> {
  const password = formData.get('password');
  const expected = process.env.ADMIN_PASSWORD;
  if (
    typeof password !== 'string' ||
    !expected ||
    password.length !== expected.length ||
    !timingSafeEqual(Buffer.from(password), Buffer.from(expected))
  ) {
    // Redirect back to login with an error indicator
    redirect('/login?error=1');
  }
  await createSession();
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
