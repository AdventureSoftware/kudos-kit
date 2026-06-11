import { Global, Module } from '@nestjs/common';
import { PrismaIngestService } from './prisma-ingest.service';
import { PrismaAdminService } from './prisma-admin.service';

@Global()
@Module({
  providers: [PrismaIngestService, PrismaAdminService],
  exports: [PrismaIngestService, PrismaAdminService],
})
export class PrismaModule {}
