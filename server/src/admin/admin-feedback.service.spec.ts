import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AdminFeedbackService } from './admin-feedback.service';
import { PrismaAdminService } from '../prisma/prisma-admin.service';

const mockPrisma = () => ({
  feedback: {
    findMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn(),
  },
  project: {
    findMany: jest.fn(),
  },
});

describe('AdminFeedbackService', () => {
  let service: AdminFeedbackService;
  let prisma: ReturnType<typeof mockPrisma>;

  beforeEach(async () => {
    prisma = mockPrisma();
    const module = await Test.createTestingModule({
      providers: [
        AdminFeedbackService,
        { provide: PrismaAdminService, useValue: prisma },
      ],
    }).compile();
    service = module.get(AdminFeedbackService);
  });

  it('returns paginated feedback with serialized BigInt ids', async () => {
    (prisma.feedback.findMany as jest.Mock).mockResolvedValue([
      { id: BigInt(1), project: 'colorpage', number: 12, type: 'bug', message: 'test',
        email: null, user_ctx: null, context: null, status: 'new', testimonial_ok: false, created_at: new Date(),
        projectRef: { prefix: 'CP' } },
    ]);
    (prisma.feedback.count as jest.Mock).mockResolvedValue(1);
    const result = await service.list({});
    expect(result.rows[0].id).toBe('1');
    expect(result.rows[0].ref).toBe('CP-12');
    expect(result.rows[0]).not.toHaveProperty('projectRef');
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('sorts by created_at desc by default, with id as tiebreaker', async () => {
    (prisma.feedback.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.feedback.count as jest.Mock).mockResolvedValue(0);
    const result = await service.list({});
    expect(prisma.feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ created_at: 'desc' }, { id: 'desc' }] }),
    );
    expect(result).toMatchObject({ sort: 'created_at', dir: 'desc', pageSize: 20 });
  });

  it('sorts by an allowed column and direction', async () => {
    (prisma.feedback.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.feedback.count as jest.Mock).mockResolvedValue(0);
    await service.list({ sort: 'status', dir: 'asc' });
    expect(prisma.feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ status: 'asc' }, { id: 'desc' }] }),
    );
  });

  it('ignores unknown sort columns', async () => {
    (prisma.feedback.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.feedback.count as jest.Mock).mockResolvedValue(0);
    await service.list({ sort: 'email; drop table', dir: 'sideways' });
    expect(prisma.feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ created_at: 'desc' }, { id: 'desc' }] }),
    );
  });

  it('filters by type and status, ignoring unknown values', async () => {
    (prisma.feedback.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.feedback.count as jest.Mock).mockResolvedValue(0);
    await service.list({ type: 'bug', status: 'new' });
    expect(prisma.feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { type: 'bug', status: 'new' } }),
    );
    await service.list({ type: 'evil', status: 'whatever' });
    expect(prisma.feedback.findMany).toHaveBeenLastCalledWith(expect.objectContaining({ where: {} }));
  });

  it('accepts praise as a type', async () => {
    (prisma.feedback.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.feedback.count as jest.Mock).mockResolvedValue(0);
    await service.list({ type: 'praise' });
    expect(prisma.feedback.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { type: 'praise' } }));
  });

  it('shows only usable testimonials with testimonial=1, and ignores other values', async () => {
    (prisma.feedback.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.feedback.count as jest.Mock).mockResolvedValue(0);
    await service.list({ testimonial: '1' });
    expect(prisma.feedback.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { testimonial_ok: true } }));
    expect(prisma.feedback.groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: { testimonial_ok: true } }));
    await service.list({ testimonial: 'yes' });
    expect(prisma.feedback.findMany).toHaveBeenLastCalledWith(expect.objectContaining({ where: {} }));
  });

  it('searches message and email case-insensitively', async () => {
    (prisma.feedback.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.feedback.count as jest.Mock).mockResolvedValue(0);
    await service.list({ q: '  export button ' });
    expect(prisma.feedback.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { OR: [
        { message: { contains: 'export button', mode: 'insensitive' } },
        { email: { contains: 'export button', mode: 'insensitive' } },
      ] },
    }));
  });

  it('treats a reference like cp-12 as an exact lookup', async () => {
    (prisma.feedback.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.feedback.count as jest.Mock).mockResolvedValue(0);
    await service.list({ q: 'cp-12' });
    expect(prisma.feedback.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { projectRef: { prefix: 'CP' }, number: 12 },
    }));
  });

  it('returns status counts for the current filters, ignoring the status filter itself', async () => {
    (prisma.feedback.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.feedback.count as jest.Mock).mockResolvedValue(3);
    (prisma.feedback.groupBy as jest.Mock).mockResolvedValue([
      { status: 'new', _count: { _all: 3 } },
      { status: 'done', _count: { _all: 5 } },
    ]);
    const result = await service.list({ type: 'bug', status: 'new' });
    expect(prisma.feedback.groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: { type: 'bug' } }));
    expect(result.statusCounts).toEqual({ all: 8, new: 3, triaged: 0, done: 5 });
  });

  it('skips to the requested page', async () => {
    (prisma.feedback.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.feedback.count as jest.Mock).mockResolvedValue(60);
    const result = await service.list({ page: '3' });
    expect(prisma.feedback.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 20, skip: 40 }));
    expect(result.totalPages).toBe(3);
  });

  it('returns one item with console logs and errors', async () => {
    (prisma.feedback.findUnique as jest.Mock).mockResolvedValue({
      id: BigInt(7), project: 'colorpage', number: 3, type: 'bug', message: 'broke',
      email: null, user_ctx: null, context: { url: 'https://x' },
      console_logs: [{ t: 1, level: 'error', msg: 'boom' }], errors: [], status: 'new', created_at: new Date(),
      projectRef: { prefix: 'CP' },
    });
    const item = await service.get('7');
    expect(item.id).toBe('7');
    expect(item.ref).toBe('CP-3');
    expect(item.console_logs).toEqual([{ t: 1, level: 'error', msg: 'boom' }]);
    expect(prisma.feedback.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: BigInt(7) } }),
    );
  });

  it('throws NotFound for a missing item', async () => {
    (prisma.feedback.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.get('99')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects ids that are not positive integers', async () => {
    await expect(service.get('abc')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.get('1; drop')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.feedback.findUnique).not.toHaveBeenCalled();
  });

  it('cycles status new → triaged', async () => {
    (prisma.feedback.findUnique as jest.Mock).mockResolvedValue({ status: 'new' });
    (prisma.feedback.update as jest.Mock).mockResolvedValue({});
    await service.cycleStatus('1');
    expect(prisma.feedback.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'triaged' } }),
    );
  });

  it('cycles status triaged → done', async () => {
    (prisma.feedback.findUnique as jest.Mock).mockResolvedValue({ status: 'triaged' });
    (prisma.feedback.update as jest.Mock).mockResolvedValue({});
    await service.cycleStatus('1');
    expect(prisma.feedback.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'done' } }),
    );
  });

  it('cycles status done → new', async () => {
    (prisma.feedback.findUnique as jest.Mock).mockResolvedValue({ status: 'done' });
    (prisma.feedback.update as jest.Mock).mockResolvedValue({});
    await service.cycleStatus('1');
    expect(prisma.feedback.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'new' } }),
    );
  });

  it('withdraws testimonial consent: clears the name, keeps the message', async () => {
    await service.withdrawTestimonial('9');
    expect(prisma.feedback.updateMany).toHaveBeenCalledWith({
      where: { id: BigInt(9), testimonial_ok: true },
      data: { testimonial_ok: false, testimonial_name: null },
    });
  });

  it('rejects a bad id when withdrawing consent', async () => {
    await expect(service.withdrawTestimonial('x')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.feedback.updateMany).not.toHaveBeenCalled();
  });

  it('deletes feedback by id', async () => {
    (prisma.feedback.delete as jest.Mock).mockResolvedValue({});
    await service.delete('5');
    expect(prisma.feedback.delete).toHaveBeenCalledWith({ where: { id: BigInt(5) } });
  });

  it('returns only projects that have feedback, ordered alphabetically', async () => {
    (prisma.project.findMany as jest.Mock).mockResolvedValue([
      { key: 'bizpage' }, { key: 'colorpage' },
    ]);
    const result = await service.listProjects();
    expect(result).toEqual(['bizpage', 'colorpage']);
    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { feedback: { some: {} } } }),
    );
  });
});
