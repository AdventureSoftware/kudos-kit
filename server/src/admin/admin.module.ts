import { Module } from '@nestjs/common';
import { AdminFeedbackService } from './admin-feedback.service';
import { AdminFeedbackController } from './admin-feedback.controller';
import { AdminStatsService } from './admin-stats.service';
import { RetentionService } from './retention.service';
import { WidgetSetupController } from './widget-setup.controller';

/** Dashboard API. Protected by Better Auth's global session guard (see app.module.ts). */
@Module({
  controllers: [AdminFeedbackController, WidgetSetupController],
  providers: [AdminFeedbackService, AdminStatsService, RetentionService],
})
export class AdminModule {}
