// server/src/feedback/notification.service.spec.ts
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import configuration from '../config/configuration';

const payload = { project: 'my-shop', type: 'bug', message: 'Something broke', id: '42' };

describe('NotificationService', () => {
  let service: NotificationService;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [NotificationService],
    }).compile();
    service = module.get(NotificationService);
    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true } as Response);
    // Reset throttle between tests
    (service as any).lastSentAt = 0;
  });

  afterEach(() => fetchSpy.mockRestore());

  it('sends email on first call', async () => {
    await service.notify(payload);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('throttles: skips if called again within 60s', async () => {
    await service.notify(payload);
    await service.notify(payload);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('sends again after throttle window passes', async () => {
    await service.notify(payload);
    (service as any).lastSentAt = Date.now() - 61_000;
    await service.notify(payload);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
