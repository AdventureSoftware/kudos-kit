// server/src/feedback/turnstile.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TurnstileService {
  constructor(private config: ConfigService) {}

  async verify(token: string, ip?: string): Promise<boolean> {
    const secret = this.config.get<string>('turnstile.secret') ?? '';
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set('remoteip', ip);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = await res.json() as { success: boolean };
    return data.success === true;
  }
}
