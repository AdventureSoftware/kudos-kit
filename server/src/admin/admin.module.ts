import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminFeedbackService } from './admin-feedback.service';
import { AdminFeedbackController } from './admin-feedback.controller';
import { AdminStatsService } from './admin-stats.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwtSecret'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, AdminFeedbackController],
  providers: [AuthService, AdminFeedbackService, AdminStatsService, JwtAuthGuard],
})
export class AdminModule {}
