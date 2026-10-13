import type { ConfigService } from '@nestjs/config';
import type { PrismaAdminService } from '../prisma/prisma-admin.service';
import { RetentionService } from './retention.service';

const DAY = 24 * 60 * 60 * 1000;
const now = new Date('2026-10-12T03:00:00Z');

const setup = (feedbackDays?: number) => {
  const prisma = {
    feedback: { deleteMany: jest.fn().mockResolvedValue({ count: 4 }) },
    session: { deleteMany: jest.fn().mockResolvedValue({ count: 2 }) },
    invitation: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
  };
  const config = { get: () => feedbackDays } as unknown as ConfigService;
  return { prisma, service: new RetentionService(prisma as unknown as PrismaAdminService, config) };
};

describe('RetentionService.purge', () => {
  it('deletes feedback older than 90 days by default', async () => {
    const { prisma, service } = setup();
    await service.purge(now);
    expect(prisma.feedback.deleteMany).toHaveBeenCalledWith({ where: { created_at: { lt: new Date(now.getTime() - 90 * DAY) } } });
  });

  it('uses FEEDBACK_RETENTION_DAYS', async () => {
    const { prisma, service } = setup(30);
    await service.purge(now);
    expect(prisma.feedback.deleteMany).toHaveBeenCalledWith({ where: { created_at: { lt: new Date(now.getTime() - 30 * DAY) } } });
  });

  it('keeps feedback forever with 0', async () => {
    const { prisma, service } = setup(0);
    const result = await service.purge(now);
    expect(prisma.feedback.deleteMany).not.toHaveBeenCalled();
    expect(result.feedback).toBe(0);
  });

  it('also removes expired logins and long-expired invitations', async () => {
    const { prisma, service } = setup();
    expect(await service.purge(now)).toEqual({ feedback: 4, sessions: 2, invitations: 1 });
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { expiresAt: { lt: now } } });
    expect(prisma.invitation.deleteMany).toHaveBeenCalledWith({ where: { expiresAt: { lt: new Date(now.getTime() - 30 * DAY) } } });
  });
});
