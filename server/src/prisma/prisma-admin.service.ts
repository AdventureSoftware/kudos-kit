import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaAdminService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const host = process.env.DB_HOST ?? 'localhost';
    const port = process.env.DB_PORT ?? '5432';
    const name = process.env.DB_NAME ?? 'feedback';
    const user = process.env.DB_ADMIN_USER ?? 'feedback_admin';
    const pass = process.env.DB_ADMIN_PASSWORD ?? '';
    super({ datasources: { db: { url: `postgresql://${user}:${pass}@${host}:${port}/${name}` } } });
  }

  async onModuleInit(): Promise<void> { await this.$connect(); }
  async onModuleDestroy(): Promise<void> { await this.$disconnect(); }
}
