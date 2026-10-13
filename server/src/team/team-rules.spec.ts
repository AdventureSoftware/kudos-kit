import { changeRoleError, removeMemberError } from './team-rules';

const owner = { userId: 'o', role: 'owner' };
const admin = { userId: 'a', role: 'admin' };
const admin2 = { userId: 'a2', role: 'admin' };
const member = { userId: 'm', role: 'member' };
const member2 = { userId: 'm2', role: 'member' };

describe('removeMemberError', () => {
  it('lets the owner remove admins and members', () => {
    expect(removeMemberError(owner, admin)).toBeNull();
    expect(removeMemberError(owner, member)).toBeNull();
  });

  it('lets an admin remove members but not other admins', () => {
    expect(removeMemberError(admin, member)).toBeNull();
    expect(removeMemberError(admin, admin2)).toMatch(/only the owner/i);
  });

  it('never removes the owner or yourself', () => {
    expect(removeMemberError(admin, owner)).toMatch(/owner can't be removed/);
    expect(removeMemberError(owner, owner)).toMatch(/yourself/);
    expect(removeMemberError(admin, admin)).toMatch(/yourself/);
  });

  it('does not let members remove anyone', () => {
    expect(removeMemberError(member, member2)).toMatch(/only owners and admins/i);
  });
});

describe('changeRoleError', () => {
  it('lets only the owner change roles', () => {
    expect(changeRoleError(owner, member)).toBeNull();
    expect(changeRoleError(owner, admin)).toBeNull();
    expect(changeRoleError(admin, member)).toMatch(/only the owner/i);
  });

  it("never changes the owner's own role", () => {
    expect(changeRoleError(owner, owner)).toMatch(/owner's role/);
  });
});
