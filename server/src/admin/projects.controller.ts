import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrgRoles } from '@thallesp/nestjs-better-auth';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService, type ProjectRow } from './projects.service';

/** The dashboard's Projects page. Everyone in the team can see the list; owners and admins change it. */
@Controller('v1/projects')
@OrgRoles(['owner', 'admin', 'member'])
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(): Promise<ProjectRow[]> {
    return this.projects.list();
  }

  @Post()
  @OrgRoles(['owner', 'admin'])
  create(@Body() dto: CreateProjectDto): Promise<ProjectRow> {
    return this.projects.create(dto);
  }

  /** Rename, or turn on and off. The key and prefix can't change. */
  @Patch(':key')
  @OrgRoles(['owner', 'admin'])
  update(@Param('key') key: string, @Body() dto: UpdateProjectDto): Promise<ProjectRow> {
    return this.projects.update(key, dto);
  }
}
