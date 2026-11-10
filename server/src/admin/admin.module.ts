import { Module } from '@nestjs/common';
import { AdminFeedbackService } from './admin-feedback.service';
import { AdminFeedbackController } from './admin-feedback.controller';
import { AdminStatsService } from './admin-stats.service';
import { RetentionService } from './retention.service';
import { WidgetSetupController } from './widget-setup.controller';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

/** Dashboard API. Protected by Better Auth's global session guard (see app.module.ts). */
@Module({
  controllers: [AdminFeedbackController, WidgetSetupController, ProjectsController],
  providers: [AdminFeedbackService, AdminStatsService, RetentionService, ProjectsService],
})
export class AdminModule {}
