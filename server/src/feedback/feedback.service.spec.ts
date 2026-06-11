import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { PrismaIngestService } from '../prisma/prisma-ingest.service';
import { TurnstileService } from './turnstile.service';
import { NotificationService } from './notification.service';
import { CreateFeedbackDto, FeedbackType } from './dto/create-feedback.dto';

const baseDto: CreateFeedbackDto = {
  project: 'colorpage',
  type: FeedbackType.BUG,
  message: 'Something broke',
  turnstileToken: 'token',
  hp: '',
};

describe('FeedbackService', () => {
  let service: FeedbackService;
  let prisma: { project: { findUnique: jest.Mock }; $queryRaw: jest.Mock };
  let turnstile: jest.Mocked<TurnstileService>;
  let notification: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    prisma = {
      project: { findUnique: jest.fn().mockResolvedValue({ active: true }) },
      $queryRaw: jest.fn().mockResolvedValue([{ id: BigInt(1) }]),
    };
    const module = await Test.createTestingModule({
      providers: [
        FeedbackService,
        { provide: PrismaIngestService, useValue: prisma },
        { provide: TurnstileService, useValue: { verify: jest.fn().mockResolvedValue(true) } },
        { provide: NotificationService, useValue: { notify: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();
    service = module.get(FeedbackService);
    turnstile = module.get(TurnstileService);
    notification = module.get(NotificationService);
  });

  it('silently drops submissions with non-empty honeypot', async () => {
    await service.submit({ ...baseDto, hp: 'bot-fill' }, '1.2.3.4');
    expect(prisma.project.findUnique).not.toHaveBeenCalled();
  });

  it('throws 400 for unknown project', async () => {
    prisma.project.findUnique.mockResolvedValueOnce(null);
    await expect(service.submit(baseDto, '1.2.3.4')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws 400 for inactive project', async () => {
    prisma.project.findUnique.mockResolvedValueOnce({ active: false });
    await expect(service.submit(baseDto, '1.2.3.4')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws 400 when Turnstile fails', async () => {
    turnstile.verify.mockResolvedValueOnce(false);
    await expect(service.submit(baseDto, '1.2.3.4')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('inserts and fires notification on valid submission', async () => {
    await service.submit(baseDto, '1.2.3.4');
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    const [, ...args] = (prisma.$queryRaw as jest.Mock).mock.calls[0];
    expect(args).toEqual([
      'colorpage', 'bug', 'Something broke', null,
      expect.anything(), // Prisma.DbNull for user_ctx
      expect.anything(), // Prisma.DbNull for context
      expect.anything(), // Prisma.DbNull for console_logs
      expect.anything(), // Prisma.DbNull for errors
      '1.2.3.4',
    ]);
    await new Promise(r => setTimeout(r, 0));
    expect(notification.notify).toHaveBeenCalledWith(
      expect.objectContaining({ project: 'colorpage', type: 'bug' }),
    );
  });
});
