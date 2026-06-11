// server/src/feedback/turnstile.service.spec.ts
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TurnstileService } from './turnstile.service';
import configuration from '../config/configuration';

describe('TurnstileService', () => {
  let service: TurnstileService;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration] })],
      providers: [TurnstileService],
    }).compile();
    service = module.get(TurnstileService);
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => fetchSpy.mockRestore());

  it('returns true on Cloudflare success', async () => {
    fetchSpy.mockResolvedValue({ json: async () => ({ success: true }) } as Response);
    expect(await service.verify('token', '1.2.3.4')).toBe(true);
  });

  it('returns false on Cloudflare failure', async () => {
    fetchSpy.mockResolvedValue({ json: async () => ({ success: false }) } as Response);
    expect(await service.verify('token')).toBe(false);
  });
});
