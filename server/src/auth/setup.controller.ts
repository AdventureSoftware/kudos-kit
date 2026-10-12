import { Controller, Get, Inject } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { AUTH_STORE } from './tokens';
import type { AuthStore } from './auth-store';

/** Tells the dashboard whether this is a fresh install that still needs its owner account. */
@AllowAnonymous()
@Controller('v1/setup')
export class SetupController {
  constructor(@Inject(AUTH_STORE) private readonly store: AuthStore) {}

  @Get('status')
  async status(): Promise<{ needsSetup: boolean }> {
    return { needsSetup: (await this.store.countUsers()) === 0 };
  }
}
