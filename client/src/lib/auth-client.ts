'use client';

import { createAuthClient } from 'better-auth/react';
import { organizationClient } from 'better-auth/client/plugins';

/**
 * Better Auth in the browser. Calls /api/auth on the dashboard's own address (see next.config.ts).
 * organizationClient adds the team calls: authClient.organization.inviteMember(), acceptInvitation()...
 */
export const authClient = createAuthClient({ plugins: [organizationClient()] });


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
    case 'INVALID_PASSWORD':
      return 'Your current password is not right.';
    case 'PASSWORD_TOO_LONG':
      return 'The password can have at most 128 characters.';
    case 'INVALID_TOKEN':
      return 'This reset link has expired or was already used. Ask for a new one.';
    case 'USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION':
      return 'That person is already in the team.';
    case 'YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION':
    case 'YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE':
      return 'Only owners and admins can invite people.';
    case 'INVITATION_LIMIT_REACHED':
      return 'Too many open invitations. Cancel a few first.';
    case 'INVITATION_NOT_FOUND':
      return 'This invitation is no longer valid. Ask for a new one.';
    case 'YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION':
      return 'This invitation is for a different email address.';
  }
  if (error.status === 403) return error.message || 'Not allowed.';
  return error.message || 'Something went wrong. Please try again.';
}
