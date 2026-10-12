import { Module } from '@nestjs/common';
import { AdminFeedbackService } from './admin-feedback.service';
import { AdminFeedbackController } from './admin-feedback.controller';
import { AdminStatsService } from './admin-stats.service';


@Module({
  controllers: [AdminFeedbackController],
  providers: [AdminFeedbackService, AdminStatsService],
})
export class AdminModule {}
