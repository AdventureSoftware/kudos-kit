import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('correctpass') },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') },
        },
      ],
    }).compile();
    service = module.get(AuthService);
    jwt = module.get(JwtService);
  });

  it('returns token for correct password', async () => {
    const result = await service.login('correctpass');
    expect(result.token).toBe('signed.jwt.token');
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'admin' });
  });

  it('throws UnauthorizedException for wrong password', async () => {
    await expect(service.login('wrongpass')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});
