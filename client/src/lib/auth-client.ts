'use client';

import { createAuthClient } from 'better-auth/react';
export const authClient = createAuthClient();


export function authErrorMessage(error: { status?: number; code?: string; message?: string } | null): string {
  if (!error) return 'Something went wrong. Please try again.';
  if (error.status === 429) return 'Too many attempts. Wait a few minutes and try again.';
  switch (error.code) {
    case 'INVALID_EMAIL_OR_PASSWORD':
      return 'Wrong email or password.';
    case 'PASSWORD_TOO_SHORT':
      return 'The password needs at least 10 characters.';
    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return 'An account with this email already exists. Sign in instead.';
    case 'INVALID_EMAIL':
      return 'Please enter a valid email address.';
  }
  if (error.status === 403) return error.message || 'Not allowed.';
  return error.message || 'Something went wrong. Please try again.';
}
