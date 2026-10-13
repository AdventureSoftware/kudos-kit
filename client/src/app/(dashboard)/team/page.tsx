import { redirect } from 'next/navigation';
import { apiFetch, getMemberRole, getSessionUser } from '@/lib/auth';
import { canManageTeam } from '@/lib/team';
import { InviteForm } from '@/components/team/InviteForm';
import { MemberList } from '@/components/team/MemberList';
import { PendingInvites } from '@/components/team/PendingInvites';
import type { TeamInvitation, TeamMember } from '@/components/team/types';

export const metadata = { title: 'Team' };

const ROLE_ORDER: Record<string, number> = { owner: 0, admin: 1, member: 2 };

export default async function TeamPage() {
  const [user, role] = await Promise.all([getSessionUser(), getMemberRole()]);
  if (!user) redirect('/login');
  const manage = canManageTeam(role);

  const [membersRes, invitesRes, emailRes] = await Promise.all([
    apiFetch('/api/auth/organization/list-members'),
    manage ? apiFetch('/api/auth/organization/list-invitations') : null,
    manage ? apiFetch('/v1/team/email-status') : null,
  ]);
  if (!membersRes.ok) throw new Error(`API error: members ${membersRes.status}`);

  const members = ((await membersRes.json()) as { members: TeamMember[] }).members.sort(
    (a, b) => (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9) || a.user.name.localeCompare(b.user.name),
  );
  const now = Date.now();
  const invites = (invitesRes?.ok ? ((await invitesRes.json()) as TeamInvitation[]) : [])
    .filter((i) => i.status === 'pending' && new Date(i.expiresAt).getTime() > now)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const emailEnabled = emailRes?.ok ? ((await emailRes.json()) as { enabled: boolean }).enabled : false;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Team</h1>
        <p className="text-muted">
          {members.length} {members.length === 1 ? 'person' : 'people'}
          {invites.length > 0 && `, ${invites.length} invited`}
        </p>
      </div>

      {manage && <InviteForm emailEnabled={emailEnabled} />}
      <MemberList members={members} me={{ userId: user.id, role: role ?? 'member' }} />
      {manage && invites.length > 0 && <PendingInvites invites={invites} members={members} />}
    </div>
  );
}
