import type { MemberRef } from '../auth/auth-store';

/** Roles an owner can give. There is exactly one owner: the person who set up Kudos Kit. */
export const ASSIGNABLE_ROLES = ['admin', 'member'] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

type Caller = Pick<MemberRef, 'userId' | 'role'>;
type Target = Pick<MemberRef, 'userId' | 'role'>;

/** Why `caller` may not remove `target` from the team, or null when allowed. */
export function removeMemberError(caller: Caller, target: Target): string | null {
  if (target.userId === caller.userId) return "You can't remove yourself.";
  if (target.role === 'owner') return "The owner can't be removed.";
  if (caller.role === 'owner') return null;
  if (caller.role !== 'admin') return 'Only owners and admins can remove people.';
  if (target.role === 'admin') return 'Only the owner can remove an admin.';
  return null;
}

/** Why `caller` may not change `target`'s role, or null when allowed. */
export function changeRoleError(caller: Caller, target: Target): string | null {
  if (caller.role !== 'owner') return 'Only the owner can change roles.';
  if (target.role === 'owner' || target.userId === caller.userId) return "The owner's role can't be changed.";
  return null;
}
