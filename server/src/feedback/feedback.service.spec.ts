import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FeedbackService, testimonialConsent } from './feedback.service';
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
      null, // user_ctx
      null, // context
      null, // console_logs
      null, // errors
      '1.2.3.4',
      false, null, // testimonial_ok, testimonial_name
      false, // testimonial_at (CASE WHEN … THEN now())
      null, // rating
    ]);
    await new Promise(r => setTimeout(r, 0));
    expect(notification.notify).toHaveBeenCalledWith(
      expect.objectContaining({ project: 'colorpage', type: 'bug', testimonial: false }),
    );
  });

  it('stores testimonial consent and the trimmed name for praise', async () => {
    await service.submit({ ...baseDto, type: FeedbackType.PRAISE, testimonialOk: true, testimonialName: '  Maria,   illustrator ' }, '1.2.3.4');
    const [, ...args] = (prisma.$queryRaw as jest.Mock).mock.calls[0];
    expect(args.slice(9)).toEqual([true, 'Maria, illustrator', true, null]);
    await new Promise(r => setTimeout(r, 0));
    expect(notification.notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'praise', testimonial: true }));
  });
});

describe('FeedbackService ratings', () => {
  let service: FeedbackService;
  let prisma: { project: { findUnique: jest.Mock }; $queryRaw: jest.Mock };

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
  });

  const ratingArg = () => (prisma.$queryRaw as jest.Mock).mock.calls[0].slice(-1)[0];

  it('stores the rating for praise, ideas and other feedback', async () => {
    await service.submit({ ...baseDto, type: FeedbackType.IDEA, rating: 4 }, '1.2.3.4');
    expect(ratingArg()).toBe(4);
  });

  it('ignores a rating on bug reports', async () => {
    await service.submit({ ...baseDto, type: FeedbackType.BUG, rating: 1 }, '1.2.3.4');
    expect(ratingArg()).toBeNull();
  });
});

describe('testimonialConsent', () => {
  it('ignores consent on anything but praise', () => {
    expect(testimonialConsent({ type: FeedbackType.BUG, testimonialOk: true, testimonialName: 'Maria' })).toEqual({ ok: false, name: null });
    expect(testimonialConsent({ type: FeedbackType.IDEA, testimonialOk: true })).toEqual({ ok: false, name: null });
  });

  it('needs the box ticked; the name alone is not consent', () => {
    expect(testimonialConsent({ type: FeedbackType.PRAISE, testimonialName: 'Maria' })).toEqual({ ok: false, name: null });
    expect(testimonialConsent({ type: FeedbackType.PRAISE, testimonialOk: false, testimonialName: 'Maria' })).toEqual({ ok: false, name: null });
  });

  it('treats an empty name as Anonymous', () => {
    expect(testimonialConsent({ type: FeedbackType.PRAISE, testimonialOk: true, testimonialName: '   ' })).toEqual({ ok: true, name: null });
    expect(testimonialConsent({ type: FeedbackType.PRAISE, testimonialOk: true })).toEqual({ ok: true, name: null });
  });
});
