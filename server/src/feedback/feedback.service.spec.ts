import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { DatabaseService } from '../database/database.service';
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
  let db: jest.Mocked<DatabaseService>;
  let turnstile: jest.Mocked<TurnstileService>;
  let notification: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: DatabaseService,
          useValue: {
            query: jest.fn().mockResolvedValue({ rows: [{ active: true, id: '1' }] }),
          },
        },
        { provide: TurnstileService, useValue: { verify: jest.fn().mockResolvedValue(true) } },
        { provide: NotificationService, useValue: { notify: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();
    service = module.get(FeedbackService);
    db = module.get(DatabaseService);
    turnstile = module.get(TurnstileService);
    notification = module.get(NotificationService);
  });

  it('silently drops submissions with non-empty honeypot', async () => {
    await service.submit({ ...baseDto, hp: 'bot-fill' }, '1.2.3.4');
    expect(db.query).not.toHaveBeenCalled();
  });

  it('throws 400 for unknown project', async () => {
    db.query.mockResolvedValueOnce({ rows: [] } as any);
    await expect(service.submit(baseDto, '1.2.3.4')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws 400 for inactive project', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ active: false }] } as any);
    await expect(service.submit(baseDto, '1.2.3.4')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws 400 when Turnstile fails', async () => {
    turnstile.verify.mockResolvedValueOnce(false);
    await expect(service.submit(baseDto, '1.2.3.4')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('inserts and fires notification on valid submission', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ active: true }] } as any) // project check
      .mockResolvedValueOnce({ rows: [{ id: '7' }] } as any);     // insert
    await service.submit(baseDto, '1.2.3.4');
    expect(db.query).toHaveBeenCalledTimes(2);
    // notification is async, give it a tick
    await new Promise(r => setTimeout(r, 0));
    expect(notification.notify).toHaveBeenCalledWith(
      expect.objectContaining({ project: 'colorpage', type: 'bug' }),
    );
  });
});
