import { randomUUID } from 'crypto';
import type { PrismaClient } from '@prisma/client';


export interface AuthStore {
  countUsers(): Promise<number>;
  hasPendingInvitation(email: string): Promise<boolean>;
  createTeamWithOwner(userId: string): Promise<void>;
  findOrganizationId(userId: string): Promise<string | null>;
  findInvitation(id: string): Promise<InvitationSummary | null>;
  findMember(memberId: string): Promise<MemberRef | null>;
  findMemberByUserId(userId: string): Promise<MemberRef | null>;
  setMemberRole(memberId: string, role: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  markEmailVerified(userId: string): Promise<void>;
}

export interface InvitationSummary {
  email: string;
  role: string;
  inviterName: string;
  expiresAt: Date;
  hasAccount: boolean;
}

export interface MemberRef {
  id: string;
  userId: string;
  role: string;
}

export const TEAM_NAME = 'Team';
export const TEAM_SLUG = 'team';

export class PrismaAuthStore implements AuthStore {
  constructor(private readonly prisma: PrismaClient) {}

  countUsers() {
    return this.prisma.user.count();
  }

  async hasPendingInvitation(email: string) {
    const invite = await this.prisma.invitation.findFirst({
      where: { email: email.toLowerCase(), status: 'pending', expiresAt: { gt: new Date() } },
      select: { id: true },
    });
    return Boolean(invite);
  }

  async createTeamWithOwner(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.upsert({
        where: { slug: TEAM_SLUG },
        update: {},
        create: { id: randomUUID(), name: TEAM_NAME, slug: TEAM_SLUG },
      });
      await tx.member.create({
        data: { id: randomUUID(), organizationId: org.id, userId, role: 'owner' },
      });
      // Sign-up has already opened a login for this user; point it at the new team.
      await tx.session.updateMany({ where: { userId }, data: { activeOrganizationId: org.id } });
    });
  }

  async findOrganizationId(userId: string) {
    const member = await this.prisma.member.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { organizationId: true },
    });
    return member?.organizationId ?? null;
  }

  async findInvitation(id: string): Promise<InvitationSummary | null> {
    const invite = await this.prisma.invitation.findFirst({
      where: { id, status: 'pending', expiresAt: { gt: new Date() } },
      select: { email: true, role: true, expiresAt: true, user: { select: { name: true } } },
    });
    if (!invite) return null;
    const hasAccount = (await this.prisma.user.count({ where: { email: invite.email } })) > 0;
    return { email: invite.email, role: invite.role ?? 'member', inviterName: invite.user.name, expiresAt: invite.expiresAt, hasAccount };
  }

  findMember(memberId: string) {
    return this.prisma.member.findUnique({ where: { id: memberId }, select: { id: true, userId: true, role: true } });
  }

  findMemberByUserId(userId: string) {
    return this.prisma.member.findFirst({ where: { userId }, select: { id: true, userId: true, role: true } });
  }

  async setMemberRole(memberId: string, role: string) {
    await this.prisma.member.update({ where: { id: memberId }, data: { role } });
  }

  async deleteUser(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  async markEmailVerified(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });
  }
}
