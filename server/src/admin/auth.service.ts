import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  async login(password: string): Promise<{ token: string }> {
    const expected = this.config.get<string>('adminPassword') ?? '';
    const a = createHmac('sha256', 'kkw-pw').update(password).digest();
    const b = createHmac('sha256', 'kkw-pw').update(expected).digest();
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException();
    }
    const token = await this.jwt.signAsync({ sub: 'admin' });
    return { token };
  }
}
