import { Controller, Delete, Get, HttpCode, Param, Patch, Query } from '@nestjs/common';
import { OrgRoles } from '@thallesp/nestjs-better-auth';
import { AdminFeedbackService } from './admin-feedback.service';
import { AdminStatsService, StatsResponse } from './admin-stats.service';

/** Every route needs a signed-in team member. Deleting and withdrawing consent need owner or admin. */
@Controller('v1/admin')
@OrgRoles(['owner', 'admin', 'member'])
export class AdminFeedbackController {
  constructor(
    private adminFeedback: AdminFeedbackService,
    private adminStats: AdminStatsService,
  ) {}

  @Get('stats')
  async stats(@Query('project') project?: string): Promise<StatsResponse> {
    return this.adminStats.stats(project || undefined);
  }

  @Get('feedback')
  async list(@Query() query: { project?: string; status?: string; type?: string; testimonial?: string; q?: string; page?: string; sort?: string; dir?: string }) {
    return this.adminFeedback.list(query);
  }

  @Get('feedback/:id')
  async get(@Param('id') id: string) {
    return this.adminFeedback.get(id);
  }

  @Get('projects')
  async projects(): Promise<string[]> {
    return this.adminFeedback.listProjects();
  }

  @Patch('feedback/:id/status')
  async cycleStatus(@Param('id') id: string): Promise<void> {
    return this.adminFeedback.cycleStatus(id);
  }

  /** The sender withdrew consent to use their praise as a testimonial (GDPR), so owners and admins. */
  @Patch('feedback/:id/testimonial/withdraw')
  @OrgRoles(['owner', 'admin'])
  @HttpCode(204)
  async withdrawTestimonial(@Param('id') id: string): Promise<void> {
    return this.adminFeedback.withdrawTestimonial(id);
  }

  /** Permanent (GDPR erasure), so limited to owners and admins. */
  @Delete('feedback/:id')
  @OrgRoles(['owner', 'admin'])
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    return this.adminFeedback.delete(id);
  }
}
