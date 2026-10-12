import { Module } from '@nestjs/common';
import { PrismaAdminService } from '../prisma/prisma-admin.service';
import { PrismaAuthStore } from './auth-store';
import { SetupController } from './setup.controller';
import { AUTH_STORE } from './tokens';

/** Account-related routes that live outside Better Auth (setup status). */
@Module({
  controllers: [SetupController],
  providers: [{ provide: AUTH_STORE, inject: [PrismaAdminService], useFactory: (p: PrismaAdminService) => new PrismaAuthStore(p) }],
  exports: [AUTH_STORE],
})
export class AccountModule {}
