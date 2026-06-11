import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaIngestService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const host = process.env.DB_HOST ?? 'localhost';
    const port = process.env.DB_PORT ?? '5432';
    const name = process.env.DB_NAME ?? 'feedback';
    const user = process.env.DB_INGEST_USER ?? 'feedback_ingest';
    const pass = process.env.DB_INGEST_PASSWORD ?? '';
    super({ datasources: { db: { url: `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${name}` } } });
  }

  async onModuleInit(): Promise<void> { await this.$connect(); }
  async onModuleDestroy(): Promise<void> { await this.$disconnect(); }
}
