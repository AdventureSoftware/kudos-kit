import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import configuration from '../config/configuration';

const payload = { project: 'my-shop', type: 'bug', message: 'Something broke', id: '42' };

const BREVO = { BREVO_API_KEY: 'test-key', BREVO_FROM_EMAIL: 'kudos@example.com', BREVO_TO_EMAIL: 'team@example.com' };

async function createService(env: Record<string, string>): Promise<NotificationService> {
  const saved = Object.fromEntries(Object.keys(BREVO).map((k) => [k, process.env[k]]));
  Object.keys(BREVO).forEach((k) => delete process.env[k]);
  Object.assign(process.env, env);
  try {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration], ignoreEnvFile: true })],
      providers: [NotificationService],
    }).compile();
    return module.get(NotificationService);
  } finally {
    Object.entries(saved).forEach(([k, v]) => (v === undefined ? delete process.env[k] : (process.env[k] = v)));
  }
}

describe('NotificationService', () => {
  let service: NotificationService;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    service = await createService(BREVO);
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

  it('does nothing when email is not set up', async () => {
    const withoutEmail = await createService({});
    await withoutEmail.notify(payload);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does nothing without a recipient', async () => {
    const withoutRecipient = await createService({ BREVO_API_KEY: 'test-key', BREVO_FROM_EMAIL: 'kudos@example.com' });
    await withoutRecipient.notify(payload);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
