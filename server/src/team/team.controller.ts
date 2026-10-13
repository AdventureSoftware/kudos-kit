import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, Inject, NotFoundException, Param, Patch } from '@nestjs/common';
import { OrgRoles, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { AUTH_STORE } from '../auth/tokens';
import type { AuthStore, MemberRef } from '../auth/auth-store';
import { MailService } from '../mail/mail.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { changeRoleError, removeMemberError } from './team-rules';

/**
 * Removing people and changing roles. Listing, inviting and cancelling invitations go
 * straight to Better Auth (/api/auth/organization/...).
 */
@Controller('v1/team')
@OrgRoles(['owner', 'admin'])
export class TeamController {
  constructor(
    @Inject(AUTH_STORE) private readonly store: AuthStore,
    private readonly mail: MailService,
  ) {}

  /** Lets the Team page say whether invitations are emailed or need to be sent by hand. */
  @Get('email-status')
  emailStatus(): { enabled: boolean } {
    return { enabled: this.mail.isConfigured() };
  }

  /** Removing someone deletes their account too: in Kudos Kit an account only exists to be in the team. */
  @Delete('members/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @Session() session: UserSession): Promise<void> {
    const [caller, target] = await this.load(session, id);
    const error = removeMemberError(caller, target);
    if (error) throw new ForbiddenException(error);
    await this.store.deleteUser(target.userId);
  }

  @Patch('members/:id/role')
  @OrgRoles(['owner'])
  @HttpCode(204)
  async changeRole(@Param('id') id: string, @Body() dto: UpdateRoleDto, @Session() session: UserSession): Promise<void> {
    const [caller, target] = await this.load(session, id);
    const error = changeRoleError(caller, target);
    if (error) throw new ForbiddenException(error);
    await this.store.setMemberRole(target.id, dto.role);
  }

  private async load(session: UserSession, memberId: string): Promise<[MemberRef, MemberRef]> {
    const [caller, target] = await Promise.all([
      this.store.findMemberByUserId(session.user.id),
      this.store.findMember(memberId),
    ]);
    if (!caller) throw new ForbiddenException('You are not in the team.');
    if (!target) throw new NotFoundException('That person is not in the team.');
    return [caller, target];
  }
}
