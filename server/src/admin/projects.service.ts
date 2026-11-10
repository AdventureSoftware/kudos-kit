import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaAdminService } from '../prisma/prisma-admin.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { KEY_PATTERN, cleanName } from './project-rules';

export interface ProjectRow {
  key: string;
  name: string;
  prefix: string;
  active: boolean;
  /** How many feedback items the project has right now. */
  reports: number;
}

const SELECT = { key: true, name: true, prefix: true, active: true, _count: { select: { feedback: true } } } as const;
type Selected = Prisma.ProjectGetPayload<{ select: typeof SELECT }>;

const toRow = ({ _count, ...p }: Selected): ProjectRow => ({ ...p, reports: _count.feedback });

/**
 * Adding, renaming and switching projects on or off from the dashboard.
 * Projects are never deleted here: their feedback and its CP-12 numbers depend on them.
 * Turning one off makes the server refuse new feedback for it; existing feedback stays.
 */
@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaAdminService) {}

  async list(): Promise<ProjectRow[]> {
    const rows = await this.prisma.project.findMany({ select: SELECT, orderBy: [{ active: 'desc' }, { name: 'asc' }] });
    return rows.map(toRow);
  }

  async create(dto: CreateProjectDto): Promise<ProjectRow> {
    const key = dto.key;
    const prefix = dto.prefix?.toUpperCase();

    const [sameKey, samePrefix] = await Promise.all([
      this.prisma.project.findUnique({ where: { key }, select: { name: true } }),
      prefix ? this.prisma.project.findUnique({ where: { prefix }, select: { name: true } }) : null,
    ]);
    if (sameKey) throw new ConflictException(`The key “${key}” is already used by ${sameKey.name}.`);
    if (samePrefix) throw new ConflictException(`The prefix ${prefix} is already used by ${samePrefix.name}.`);

    try {
      const row = await this.prisma.project.create({
        // An empty prefix lets the database pick one from the key (db/migrations/002_project_refs.sql).
        data: { key, name: cleanName(dto.name), active: true, prefix: prefix ?? '' },
        select: SELECT,
      });
      return toRow(row);
    } catch (err) {
      // Someone added the same key or prefix a moment ago.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('That key or prefix was just taken. Please choose another.');
      }
      throw err;
    }
  }

  async update(key: string, dto: UpdateProjectDto): Promise<ProjectRow> {
    const data: Prisma.ProjectUpdateInput = {
      ...(dto.name !== undefined ? { name: cleanName(dto.name) } : {}),
      ...(dto.active !== undefined ? { active: dto.active } : {}),
    };
    if (Object.keys(data).length === 0) throw new BadRequestException('Nothing to change.');
    if (!KEY_PATTERN.test(key)) throw new NotFoundException('Project not found.');

    try {
      return toRow(await this.prisma.project.update({ where: { key }, data, select: SELECT }));
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException('Project not found.');
      }
      throw err;
    }
  }
}
