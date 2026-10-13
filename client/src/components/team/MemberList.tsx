import { Badge, Card, Table, Td, Th, Tr } from '@/components/ui';
import { canChangeRole, canRemove, roleLabel } from '@/lib/team';
import { RemoveMemberButton, RoleSelect } from './MemberControls';
import type { TeamMember } from './types';

const joinedFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

interface MemberListProps {
  members: TeamMember[];
  me: { userId: string; role: string };
}

export function MemberList({ members, me }: MemberListProps) {
  return (
    <Card className="overflow-hidden">
      <h2 className="px-5 pt-4 pb-3 text-sm font-semibold">Members</h2>
      <Table>
        <thead>
          <tr>
            <Th>Person</Th>
            <Th className="w-40">Role</Th>
            <Th className="w-32">Joined</Th>
            <Th className="w-24"><span className="sr-only">Actions</span></Th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const target = { userId: m.userId, role: m.role };
            const isMe = m.userId === me.userId;
            return (
              <Tr key={m.id}>
                <Td>
                  <span className="block font-medium text-text">
                    {m.user.name}
                    {isMe && <span className="font-normal text-muted"> (you)</span>}
                  </span>
                  <span className="block text-xs text-muted">{m.user.email}</span>
                </Td>
                <Td>
                  {canChangeRole(me, target) ? (
                    <RoleSelect memberId={m.id} role={m.role as 'admin' | 'member'} name={m.user.name} />
                  ) : (
                    <Badge tone={m.role === 'owner' ? 'accent' : 'neutral'}>{roleLabel(m.role)}</Badge>
                  )}
                </Td>
                <Td className="text-muted tabular-nums">{joinedFmt.format(new Date(m.createdAt))}</Td>
                <Td className="text-right">
                  {canRemove(me, target) && <RemoveMemberButton memberId={m.id} name={m.user.name} />}
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
}
