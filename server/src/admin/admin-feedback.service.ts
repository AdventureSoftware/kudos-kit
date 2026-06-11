import { Injectable } from '@nestjs/common';
import { PrismaAdminService } from '../prisma/prisma-admin.service';

const PAGE_SIZE = 25;
const STATUS_CYCLE: Record<string, string> = {
  new: 'triaged',
  triaged: 'done',
  done: 'new',
};

interface ListFilters {
  project?: string;
  status?: string;
  page?: string;
}

@Injectable()
export class AdminFeedbackService {
  constructor(private prisma: PrismaAdminService) {}

  async list(filters: ListFilters) {
    const page = Math.max(1, parseInt(filters.page ?? '1', 10) || 1);
    const where = {
      ...(filters.project ? { project: filters.project } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        select: {
          id: true,
          project: true,
          type: true,
          message: true,
          email: true,
          user_ctx: true,
          context: true,
          status: true,
          created_at: true,
        },
      }),
      this.prisma.feedback.count({ where }),
    ]);
    return {
      rows: rows.map(r => ({ ...r, id: r.id.toString() })),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  async listProjects(): Promise<string[]> {
    const projects = await this.prisma.project.findMany({ orderBy: { key: 'asc' } });
    return projects.map(p => p.key);
  }

  async cycleStatus(id: string): Promise<void> {
    const row = await this.prisma.feedback.findUnique({
      where: { id: BigInt(id) },
      select: { status: true },
    });
    if (!row) return;
    const next = STATUS_CYCLE[row.status] ?? 'new';
    await this.prisma.feedback.update({
      where: { id: BigInt(id) },
      data: { status: next },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.feedback.delete({ where: { id: BigInt(id) } });
  }
}
