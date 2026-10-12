import { canCreateAccount, shouldBecomeOwner } from './account-rules';
import type { AuthStore } from './auth-store';

const store = (over: Partial<AuthStore> = {}): AuthStore => ({
  countUsers: jest.fn().mockResolvedValue(0),
  hasPendingInvitation: jest.fn().mockResolvedValue(false),
  createTeamWithOwner: jest.fn(),
  findOrganizationId: jest.fn().mockResolvedValue(null),
  ...over,
});

describe('canCreateAccount', () => {
  it('allows the first account on a fresh install', async () => {
    expect(await canCreateAccount(store(), 'owner@example.com')).toBe(true);
  });

  it('refuses a stranger once an account exists', async () => {
    expect(await canCreateAccount(store({ countUsers: jest.fn().mockResolvedValue(1) }), 'x@example.com')).toBe(false);
  });

  it('allows someone with a pending invitation', async () => {
    const s = store({ countUsers: jest.fn().mockResolvedValue(3), hasPendingInvitation: jest.fn().mockResolvedValue(true) });
    expect(await canCreateAccount(s, 'invited@example.com')).toBe(true);
    expect(s.hasPendingInvitation).toHaveBeenCalledWith('invited@example.com');
  });
});

describe('shouldBecomeOwner', () => {
  it('is true for the only account, not yet in a team', async () => {
    expect(await shouldBecomeOwner(store({ countUsers: jest.fn().mockResolvedValue(1) }), 'u1')).toBe(true);
  });

  it('is false once others exist', async () => {
    expect(await shouldBecomeOwner(store({ countUsers: jest.fn().mockResolvedValue(2) }), 'u2')).toBe(false);
  });

  it('is false for someone already in a team (e.g. joined by invitation)', async () => {
    const s = store({ countUsers: jest.fn().mockResolvedValue(1), findOrganizationId: jest.fn().mockResolvedValue('org') });
    expect(await shouldBecomeOwner(s, 'u1')).toBe(false);
  });
});
