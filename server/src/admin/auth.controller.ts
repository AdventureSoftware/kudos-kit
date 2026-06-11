import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('v1/admin')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { password: string }): Promise<{ token: string }> {
    return this.auth.login(body.password);
  }
}
