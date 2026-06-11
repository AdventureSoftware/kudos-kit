import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let service: jest.Mocked<FeedbackService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [{ provide: FeedbackService, useValue: { submit: jest.fn() } }],
    }).compile();
    controller = module.get(FeedbackController);
    service = module.get(FeedbackService);
  });

  it('calls service.submit with dto and ip', async () => {
    const dto: any = { project: 'colorpage', type: 'bug', message: 'test', turnstileToken: 't', hp: '' };
    const req: any = { ip: '5.5.5.5' };
    await controller.submitFeedback(dto, req);
    expect(service.submit).toHaveBeenCalledWith(dto, '5.5.5.5');
  });
});
