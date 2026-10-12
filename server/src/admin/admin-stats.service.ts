import { Injectable } from '@nestjs/common';
import { PrismaAdminService } from '../prisma/prisma-admin.service';

export interface StatsResponse {
  total: number;
  byStatus: Record<'new' | 'triaged' | 'done', number>;
  byType: Record<'bug' | 'idea' | 'other', number>;
  byProject: Array<{ project: string; total: number; new: number }>;
  last7: number;
  prev7: number;
  daily: Array<{ date: string; count: number }>;
}

const DAYS = 14;

@Injectable()
export class AdminStatsService {
  constructor(private prisma: PrismaAdminService) {}

  async stats(project?: string): Promise<StatsResponse> {
    const where = project ? { project } : {};
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const since7 = new Date(now - 7 * day);
    const since14 = new Date(now - 14 * day);

    const [total, statusGroups, typeGroups, projectGroups, last7, prev7, daily] = await Promise.all([
      this.prisma.feedback.count({ where }),
      this.prisma.feedback.groupBy({ by: ['status'], where, _count: { _all: true } }),
      this.prisma.feedback.groupBy({ by: ['type'], where, _count: { _all: true } }),
      this.prisma.feedback.groupBy({ by: ['project', 'status'], where, _count: { _all: true } }),
      this.prisma.feedback.count({ where: { ...where, created_at: { gte: since7 } } }),
      this.prisma.feedback.count({ where: { ...where, created_at: { gte: since14, lt: since7 } } }),
      this.dailyCounts(project),
    ]);

    const byStatus = { new: 0, triaged: 0, done: 0 };
    for (const g of statusGroups) {
      if (g.status in byStatus) byStatus[g.status as keyof typeof byStatus] = g._count._all;
    }

    const byType = { bug: 0, idea: 0, other: 0 };
    for (const g of typeGroups) {
      if (g.type in byType) byType[g.type as keyof typeof byType] = g._count._all;
    }

    const projects = new Map<string, { project: string; total: number; new: number }>();
    for (const g of projectGroups) {
      const p = projects.get(g.project) ?? { project: g.project, total: 0, new: 0 };
      p.total += g._count._all;
      if (g.status === 'new') p.new += g._count._all;
      projects.set(g.project, p);
    }

    return {
      total,
      byStatus,
      byType,
      byProject: [...projects.values()].sort((a, b) => b.total - a.total),
      last7,
      prev7,
      daily,
    };
  }

  /** Counts per calendar day (UTC) for the last DAYS days, with zero-filled gaps. */
  private async dailyCounts(project?: string): Promise<StatsResponse['daily']> {
    const today = new Date();
    const dayStart = (offset: number) =>
      new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset));
    const since = dayStart(DAYS - 1); // midnight UTC, 13 days ago → 14 days including today

    const rows = project
      ? await this.prisma.$queryRaw<{ day: Date; count: bigint }[]>`
          SELECT date_trunc('day', created_at AT TIME ZONE 'UTC') AS day, count(*) AS count
          FROM feedback
          WHERE created_at >= ${since} AND project = ${project}
          GROUP BY 1`
      : await this.prisma.$queryRaw<{ day: Date; count: bigint }[]>`
          SELECT date_trunc('day', created_at AT TIME ZONE 'UTC') AS day, count(*) AS count
          FROM feedback
          WHERE created_at >= ${since}
          GROUP BY 1`;

    const byDay = new Map(rows.map((r) => [toIsoDay(new Date(r.day)), Number(r.count)]));
    const out: StatsResponse['daily'] = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const key = toIsoDay(dayStart(i));
      out.push({ date: key, count: byDay.get(key) ?? 0 });
    }
    return out;
  }
}

function toIsoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
