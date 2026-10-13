import { Module } from '@nestjs/common';
import { PrismaAdminService } from '../prisma/prisma-admin.service';
import { MailModule } from '../mail/mail.module';
import { PrismaAuthStore } from './auth-store';
import { InvitationController } from './invitation.controller';
import { SetupController } from './setup.controller';
import { AUTH_STORE } from './tokens';

/** Account-related routes that live outside Better Auth (setup status, invitation lookup). */
@Module({
  imports: [MailModule],
  controllers: [SetupController, InvitationController],
  providers: [{ provide: AUTH_STORE, inject: [PrismaAdminService], useFactory: (p: PrismaAdminService) => new PrismaAuthStore(p) }],
  exports: [AUTH_STORE],
})
export class AccountModule {}
