import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TurnstileService } from './turnstile.service';
import { NotificationService } from './notification.service';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FeedbackController],
  providers: [TurnstileService, NotificationService, FeedbackService],
})
export class FeedbackModule {}
