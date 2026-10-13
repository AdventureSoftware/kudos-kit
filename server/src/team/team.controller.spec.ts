import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import type { AuthStore, MemberRef } from '../auth/auth-store';
import type { MailService } from '../mail/mail.service';
import { TeamController } from './team.controller';

const members: Record<string, MemberRef> = {
  mo: { id: 'mo', userId: 'owner', role: 'owner' },
  ma: { id: 'ma', userId: 'admin', role: 'admin' },
  mm: { id: 'mm', userId: 'member', role: 'member' },
};

const makeStore = () =>
  ({
    findMember: jest.fn(async (id: string) => members[id] ?? null),
    findMemberByUserId: jest.fn(async (userId: string) => Object.values(members).find((m) => m.userId === userId) ?? null),
    deleteUser: jest.fn(),
    setMemberRole: jest.fn(),
  }) as unknown as AuthStore & { deleteUser: jest.Mock; setMemberRole: jest.Mock };

const mail = { isConfigured: () => false } as unknown as MailService;

const as = (userId: string) => ({ user: { id: userId }, session: {} }) as unknown as UserSession;

describe('TeamController', () => {
  it('removes a member by deleting their account', async () => {
    const store = makeStore();
    await new TeamController(store, mail).remove('mm', as('admin'));
    expect(store.deleteUser).toHaveBeenCalledWith('member');
  });

  it('refuses to remove the owner', async () => {
    const store = makeStore();
    await expect(new TeamController(store, mail).remove('mo', as('admin'))).rejects.toBeInstanceOf(ForbiddenException);
    expect(store.deleteUser).not.toHaveBeenCalled();
  });

  it('answers 404 for someone not in the team', async () => {
    await expect(new TeamController(makeStore(), mail).remove('nope', as('owner'))).rejects.toBeInstanceOf(NotFoundException);
  });

  it('reports whether email is set up', () => {
    expect(new TeamController(makeStore(), mail).emailStatus()).toEqual({ enabled: false });
  });

  it('lets the owner change a role', async () => {
    const store = makeStore();
    await new TeamController(store, mail).changeRole('mm', { role: 'admin' }, as('owner'));
    expect(store.setMemberRole).toHaveBeenCalledWith('mm', 'admin');
  });
});
