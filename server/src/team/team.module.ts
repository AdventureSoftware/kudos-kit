import { Module } from '@nestjs/common';
import { AccountModule } from '../auth/account.module';
import { MailModule } from '../mail/mail.module';
import { TeamController } from './team.controller';

@Module({
  imports: [AccountModule, MailModule],
  controllers: [TeamController],
})
export class TeamModule {}
