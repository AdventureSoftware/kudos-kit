
export type Role = 'owner' | 'admin' | 'member';

export const ROLE_LABELS: Record<Role, string> = { owner: 'Owner', admin: 'Admin', member: 'Member' };

export const ROLE_HINTS: Record<'admin' | 'member', string> = {
  admin: 'Can invite and remove members, and delete feedback.',
  member: 'Can read feedback and change its status.',
};

export const roleLabel = (role: string) => ROLE_LABELS[role as Role] ?? role;

export const canManageTeam = (role: string | null) => role === 'owner' || role === 'admin';

type Person = { userId: string; role: string };

export function canRemove(me: Person, target: Person): boolean {
  if (target.userId === me.userId || target.role === 'owner') return false;
  if (me.role === 'owner') return true;
  return me.role === 'admin' && target.role === 'member';
}

export function canChangeRole(me: Person, target: Person): boolean {
  return me.role === 'owner' && target.role !== 'owner' && target.userId !== me.userId;
}
