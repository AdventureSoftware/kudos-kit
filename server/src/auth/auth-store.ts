import { randomUUID } from 'crypto';
import type { PrismaClient } from '@prisma/client';


export interface AuthStore {
  countUsers(): Promise<number>;
  hasPendingInvitation(email: string): Promise<boolean>;
  createTeamWithOwner(userId: string): Promise<void>;
  findOrganizationId(userId: string): Promise<string | null>;
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
}
