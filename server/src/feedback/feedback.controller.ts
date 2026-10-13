import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { Request } from 'express';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';

/** Public: the widget posts here from any site, without a login. */
@AllowAnonymous()
@Controller('v1')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('feedback')
  @HttpCode(HttpStatus.CREATED)
  async submitFeedback(@Body() dto: CreateFeedbackDto, @Req() req: Request): Promise<void> {
    await this.feedbackService.submit(dto, req.ip ?? '0.0.0.0');
  }
}
