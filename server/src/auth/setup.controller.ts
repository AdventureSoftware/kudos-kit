import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { AUTH_STORE } from './tokens';
import type { AuthStore } from './auth-store';
import { MailService } from '../mail/mail.service';
import type { AuthSettings } from './auth.config';
import { enabledProviders, type SocialProviderId } from './social';


@AllowAnonymous()
@Controller('v1/setup')
export class SetupController {
  constructor(
    @Inject(AUTH_STORE) private readonly store: AuthStore,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  @Get('status')
  async status(): Promise<{ needsSetup: boolean; emailEnabled: boolean; providers: SocialProviderId[]; retentionDays: number }> {
    return {
      needsSetup: (await this.store.countUsers()) === 0,
      emailEnabled: this.mail.isConfigured(),
      providers: enabledProviders(this.config.get<AuthSettings>('auth')?.social),
      retentionDays: this.config.get<number>('retention.feedbackDays') ?? 90,
    };
  }
}
