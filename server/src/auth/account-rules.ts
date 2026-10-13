import type { AuthStore } from './auth-store';

/** Who may create an account: the very first person (setup), or someone with a pending invitation. */
export async function canCreateAccount(store: AuthStore, email: string): Promise<boolean> {
  if ((await store.countUsers()) === 0) return true;
  return store.hasPendingInvitation(email);
}

/** Should this user become the team's owner? Only the first account on a fresh install, not yet in a team. */
export async function shouldBecomeOwner(store: AuthStore, userId: string): Promise<boolean> {
  return (await store.findOrganizationId(userId)) === null && (await store.countUsers()) === 1;
}

