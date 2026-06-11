import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    const auth = req.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) return false;
    try {
      await this.jwt.verifyAsync(auth.slice(7), {
        secret: this.config.get<string>('jwtSecret'),
        algorithms: ['HS256'],
      });
      return true;
    } catch {
      return false;
    }
  }
}
