import { Controller, Delete, Get, HttpCode, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminFeedbackService } from './admin-feedback.service';
import { AdminStatsService, StatsResponse } from './admin-stats.service';

@Controller('v1/admin')
@UseGuards(JwtAuthGuard)
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
  async list(@Query() query: { project?: string; status?: string; type?: string; q?: string; page?: string; sort?: string; dir?: string }) {
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

  @Delete('feedback/:id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    return this.adminFeedback.delete(id);
  }
}
