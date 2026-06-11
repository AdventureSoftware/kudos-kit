import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('v1')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post('feedback')
  @HttpCode(HttpStatus.CREATED)
  async submitFeedback(@Body() dto: CreateFeedbackDto, @Req() req: Request): Promise<void> {
    await this.feedbackService.submit(dto, req.ip ?? '0.0.0.0');
  }
}
