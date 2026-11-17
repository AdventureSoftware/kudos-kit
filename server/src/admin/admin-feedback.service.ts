import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaAdminService } from '../prisma/prisma-admin.service';

const PAGE_SIZE = 20;
const STATUS_CYCLE: Record<string, string> = {
  new: 'triaged',
  triaged: 'done',
  done: 'new',
};

/** Columns the list may be sorted by. Anything else falls back to the default. */
const SORTABLE = ['created_at', 'project', 'type', 'status'] as const;
type SortField = (typeof SORTABLE)[number];

const STATUSES = ['new', 'triaged', 'done'] as const;
const TYPES = ['bug', 'idea', 'praise', 'other'] as const;
const MAX_QUERY = 100;
/** A reference such as "MS-12" (case-insensitive). */
const REF_PATTERN = /^([A-Za-z][A-Za-z0-9]{0,4})-(\d{1,9})$/;

interface ListFilters {
  project?: string;
  status?: string;
  type?: string;
  /** Free-text search over message and email, or an exact reference like MS-12. */
  q?: string;
  /** "1": only praise the sender agreed may be shown publicly. */
  testimonial?: string;
  page?: string;
  sort?: string;
  dir?: string;
}

const oneOf = <T extends string>(list: readonly T[], v?: string): T | undefined =>
  (list as readonly string[]).includes(v ?? '') ? (v as T) : undefined;

/** Human-facing reference, e.g. "MS-12". */
const toRef = (prefix: string, number: number) => `${prefix}-${number}`;

/** Parse a route id into a BigInt, rejecting anything that is not a positive integer. */
function parseId(id: string): bigint {
  if (!/^\d{1,19}$/.test(id)) throw new BadRequestException('Invalid id');
  return BigInt(id);
}

@Injectable()
export class AdminFeedbackService {
  constructor(private prisma: PrismaAdminService) {}

  async list(filters: ListFilters) {
    const page = Math.max(1, parseInt(filters.page ?? '1', 10) || 1);
    const sort: SortField = (SORTABLE as readonly string[]).includes(filters.sort ?? '')
      ? (filters.sort as SortField)
      : 'created_at';
    const dir: 'asc' | 'desc' = filters.dir === 'asc' ? 'asc' : 'desc';
    const status = oneOf(STATUSES, filters.status);
    const type = oneOf(TYPES, filters.type);
    const q = (filters.q ?? '').trim().slice(0, MAX_QUERY);

    // Everything except the status filter: the status tabs show counts for this set.
    const base: Prisma.FeedbackWhereInput = {
      ...(filters.project ? { project: filters.project } : {}),
      ...(type ? { type } : {}),
      ...(filters.testimonial === '1' ? { testimonial_ok: true } : {}),
      ...(q ? this.searchWhere(q) : {}),
    };
    const where: Prisma.FeedbackWhereInput = { ...base, ...(status ? { status } : {}) };

    const [rows, total, statusGroups] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        // Secondary order by id keeps rows stable when the sorted values are equal.
        orderBy: [{ [sort]: dir }, { id: 'desc' }],
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        select: {
          id: true,
          project: true,
          number: true,
          type: true,
          message: true,
          email: true,
          user_ctx: true,
          context: true,
          status: true,
          testimonial_ok: true,
          rating: true,
          created_at: true,
          projectRef: { select: { prefix: true } },
        },
      }),
      this.prisma.feedback.count({ where }),
      this.prisma.feedback.groupBy({ by: ['status'], where: base, _count: { _all: true } }),
    ]);

    const statusCounts = { all: 0, new: 0, triaged: 0, done: 0 };
    for (const g of statusGroups) {
      statusCounts.all += g._count._all;
      if (g.status in statusCounts) statusCounts[g.status as keyof typeof statusCounts] = g._count._all;
    }
    return {
      rows: rows.map(({ projectRef, ...r }) => ({
        ...r,
        id: r.id.toString(),
        ref: toRef(projectRef.prefix, r.number),
      })),
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
      sort,
      dir,
      statusCounts,
    };
  }

  /** "MS-12" finds that exact item; anything else matches message or email, ignoring case. */
  private searchWhere(q: string): Prisma.FeedbackWhereInput {
    const ref = REF_PATTERN.exec(q);
    if (ref) {
      return { projectRef: { prefix: ref[1].toUpperCase() }, number: Number(ref[2]) };
    }
    return {
      OR: [
        { message: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    };
  }

  /** One feedback item with everything captured: context, console logs and errors. */
  async get(id: string) {
    const row = await this.prisma.feedback.findUnique({
      where: { id: parseId(id) },
      select: {
        id: true,
        project: true,
        number: true,
        type: true,
        message: true,
        email: true,
        user_ctx: true,
        context: true,
        console_logs: true,
        errors: true,
        status: true,
        testimonial_ok: true,
        testimonial_name: true,
        testimonial_at: true,
        rating: true,
        created_at: true,
        projectRef: { select: { prefix: true } },
      },
    });
    if (!row) throw new NotFoundException('Feedback not found');
    const { projectRef, ...rest } = row;
    return { ...rest, id: row.id.toString(), ref: toRef(projectRef.prefix, row.number) };
  }

  /** Projects that have at least one feedback item: the only ones worth filtering by. */
  async listProjects(): Promise<string[]> {
    const projects = await this.prisma.project.findMany({
      where: { feedback: { some: {} } },
      orderBy: { key: 'asc' },
    });
    return projects.map(p => p.key);
  }

  async cycleStatus(id: string): Promise<void> {
    const row = await this.prisma.feedback.findUnique({
      where: { id: parseId(id) },
      select: { status: true },
    });
    if (!row) return;
    const next = STATUS_CYCLE[row.status] ?? 'new';
    await this.prisma.feedback.update({
      where: { id: BigInt(id) },
      data: { status: next },
    });
  }

  /**
   * The sender asked us to stop using their praise publicly. Keeps the message and when consent
   * was given (the record), clears the name. Does nothing if there was no consent.
   */
  async withdrawTestimonial(id: string): Promise<void> {
    await this.prisma.feedback.updateMany({
      where: { id: parseId(id), testimonial_ok: true },
      data: { testimonial_ok: false, testimonial_name: null },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.feedback.delete({ where: { id: parseId(id) } });
  }
}
