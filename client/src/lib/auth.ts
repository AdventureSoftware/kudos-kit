'server only'

import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SECRET = process.env.SESSION_SECRET!;
const MAX_AGE_S = 7 * 24 * 60 * 60;

function sign(value: string): string {
  return createHmac('sha256', SECRET).update(value).digest('hex');
}

export async function createSession(): Promise<void> {
  const expiry = Math.floor(Date.now() / 1000) + MAX_AGE_S;
  const token = `${expiry}:${sign(String(expiry))}`;
  const store = await cookies();
  store.set('kkw_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_S,
    path: '/',
  });
}

export async function getSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get('kkw_session')?.value;
  if (!token) return false;
  const colonIdx = token.indexOf(':');
  if (colonIdx === -1) return false;
  const expiry = token.slice(0, colonIdx);
  const sig = token.slice(colonIdx + 1);
  const expected = sign(expiry);
  try {
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) return false;
    if (!timingSafeEqual(sigBuf, expBuf)) return false;
  } catch {
    return false;
  }
  return parseInt(expiry, 10) > Math.floor(Date.now() / 1000);
}

export async function requireAuth(): Promise<void> {
  if (!(await getSession())) redirect('/login');
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete('kkw_session');
}
