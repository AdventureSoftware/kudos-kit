import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { AUTH_STORE } from './tokens';
import type { AuthStore } from './auth-store';

export interface InvitationResponse {
  email: string;
  role: string;
  inviterName: string;
  expiresAt: string;
  hasAccount: boolean;
}


@AllowAnonymous()
@Controller('v1/invitations')
export class InvitationController {
  constructor(@Inject(AUTH_STORE) private readonly store: AuthStore) {}

  @Get(':id')
  async get(@Param('id') id: string): Promise<InvitationResponse> {
    const invite = id.length <= 100 ? await this.store.findInvitation(id) : null;
    if (!invite) throw new NotFoundException('This invitation is no longer valid.');
    return { ...invite, expiresAt: invite.expiresAt.toISOString() };
  }
}
