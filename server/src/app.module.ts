import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { join } from 'path';
import { FeedbackModule } from './feedback/feedback.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaAdminService } from './prisma/prisma-admin.service';
import { AdminModule } from './admin/admin.module';
import { AccountModule } from './auth/account.module';
import { AUTH_STORE } from './auth/tokens';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { TeamModule } from './team/team.module';
import type { AuthStore } from './auth/auth-store';
import { createAuth, type AuthSettings } from './auth/auth.config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 900_000, limit: 5 }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    PrismaModule,
    AccountModule,
    // Better Auth on /api/auth, using the admin database role (the only role allowed to touch auth tables).
    // Its global guard protects every route; public ones say @AllowAnonymous().
    AuthModule.forRootAsync({
      imports: [AccountModule, MailModule],
      inject: [ConfigService, PrismaAdminService, AUTH_STORE, MailService],
      useFactory: (config: ConfigService, prisma: PrismaAdminService, store: AuthStore, mailer: MailService) => ({
        auth: createAuth({
          database: prismaAdapter(prisma, { provider: 'postgresql' }),
          store,
          mailer,
          settings: config.getOrThrow<AuthSettings>('auth'),
        }),
        disableBodyParser: true,          // main.ts adds parsers with a size limit
        disableTrustedOriginsCors: true,  // main.ts keeps the widget's open CORS
      }),
    }),
    FeedbackModule,
    AdminModule,
    TeamModule,
  ],
})
export class AppModule {}
