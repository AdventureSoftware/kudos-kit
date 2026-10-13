
export type SocialProvider = 'google' | 'apple';

export const PROVIDER_NAMES: Record<SocialProvider, string> = { google: 'Google', apple: 'Apple' };


export function socialErrorMessage(code: string | undefined): string | null {
  if (!code) return null;
  switch (code) {
    case 'signup_disabled':
      return 'No Kudos Kit account uses that Google or Apple account. Sign in with your password and connect it on your Account page, or ask for an invitation.';
    case 'INVITE_ONLY':
      return 'There is no invitation for that account’s email address. Use the account with the invited email, or create a password below.';
    case 'account_not_linked':
      return 'An account with this email already exists. Sign in with your password once, then connect Google or Apple on your Account page.';
    case 'account_already_linked_to_different_user':
      return 'That Google or Apple account is already connected to someone else in this Kudos Kit.';
    case 'access_denied':
      return 'Sign-in was cancelled.';
    case 'email_not_found':
      return 'Google or Apple did not share an email address, so we could not sign you in.';
    default:
      return 'Signing in with Google or Apple didn’t work. Please try again.';
  }
}
