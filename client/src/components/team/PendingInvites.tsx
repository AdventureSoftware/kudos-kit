import { Badge, Card, Table, Td, Th, Tr } from '@/components/ui';
import { roleLabel } from '@/lib/team';
import { CancelInviteButton, CopyLinkButton } from './InviteControls';
import type { TeamInvitation, TeamMember } from './types';

const DAY = 24 * 60 * 60 * 1000;

function expiresIn(iso: string): string {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / DAY);
  return days <= 1 ? 'Today' : `In ${days} days`;
}


export function PendingInvites({ invites, members }: { invites: TeamInvitation[]; members: TeamMember[] }) {
  const nameOf = (userId: string) => members.find((m) => m.userId === userId)?.user.name ?? '—';

  return (
    <Card className="overflow-hidden">
      <h2 className="px-5 pt-4 pb-3 text-sm font-semibold">Pending invitations</h2>
      <Table>
        <thead>
          <tr>
            <Th>Email</Th>
            <Th className="w-28">Role</Th>
            <Th className="w-36">Invited by</Th>
            <Th className="w-28">Expires</Th>
            <Th className="w-44"><span className="sr-only">Actions</span></Th>
          </tr>
        </thead>
        <tbody>
          {invites.map((inv) => (
            <Tr key={inv.id}>
              <Td className="font-medium text-text">{inv.email}</Td>
              <Td><Badge>{roleLabel(inv.role)}</Badge></Td>
              <Td className="text-muted">{nameOf(inv.inviterId)}</Td>
              <Td className="text-muted">{expiresIn(inv.expiresAt)}</Td>
              <Td className="text-right">
                <div className="inline-flex items-center gap-1">
                  <CopyLinkButton invitationId={inv.id} />
                  <CancelInviteButton invitationId={inv.id} />
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
