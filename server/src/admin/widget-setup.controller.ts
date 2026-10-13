import { Controller, Get } from '@nestjs/common';
import { OrgRoles } from '@thallesp/nestjs-better-auth';
import { PrismaAdminService } from '../prisma/prisma-admin.service';

export interface WidgetProject {
  key: string;
  name: string;
  prefix: string;
}

/** For the dashboard's Widget page: every active project, to build its install snippet. */
@Controller('v1/admin/widget')
@OrgRoles(['owner', 'admin', 'member'])
export class WidgetSetupController {
  constructor(private readonly prisma: PrismaAdminService) {}

  @Get('projects')
  projects(): Promise<WidgetProject[]> {
    return this.prisma.project.findMany({
      where: { active: true },
      select: { key: true, name: true, prefix: true },
      orderBy: { name: 'asc' },
    });
  }
}
