import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('v1/admin')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  async login(@Body() body: LoginDto): Promise<{ token: string }> {
    return this.auth.login(body.password);
  }
}
