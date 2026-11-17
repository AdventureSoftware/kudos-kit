import { NextResponse, type NextRequest } from 'next/server';

/**
 * The home address (/) has two faces:
 * - signed in: the dashboard Overview (app/(dashboard)/page.tsx)
 * - not signed in: the landing page (app/welcome/page.tsx), shown at / without changing the address,
 *   or the sign-in page when LANDING_PAGE=false
 */
const SESSION_COOKIES = ['better-auth.session_token', '__Secure-better-auth.session_token'];

export function proxy(request: NextRequest) {
  if (SESSION_COOKIES.some((name) => request.cookies.has(name))) return NextResponse.next();
  return NextResponse.rewrite(new URL('/welcome', request.url));
}

export const config = { matcher: '/' };
