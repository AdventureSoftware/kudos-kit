import { Controller, Delete, Get, HttpCode, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminFeedbackService } from './admin-feedback.service';

@Controller('v1/admin')
@UseGuards(JwtAuthGuard)
export class AdminFeedbackController {
  constructor(private adminFeedback: AdminFeedbackService) {}

  @Get('feedback')
  async list(@Query() query: { project?: string; status?: string; page?: string }) {
    return this.adminFeedback.list(query);
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
