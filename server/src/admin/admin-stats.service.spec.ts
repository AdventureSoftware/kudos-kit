import { Test } from '@nestjs/testing';
import { AdminStatsService } from './admin-stats.service';
import { PrismaAdminService } from '../prisma/prisma-admin.service';

const mockPrisma = () => ({
  feedback: {
    count: jest.fn(),
    groupBy: jest.fn(),
    aggregate: jest.fn().mockResolvedValue({ _avg: { rating: 4.333 }, _count: { rating: 3 } }),
  },
  $queryRaw: jest.fn(),
});

describe('AdminStatsService', () => {
  let service: AdminStatsService;
  let prisma: ReturnType<typeof mockPrisma>;

  beforeEach(async () => {
    prisma = mockPrisma();
    const module = await Test.createTestingModule({
      providers: [AdminStatsService, { provide: PrismaAdminService, useValue: prisma }],
    }).compile();
    service = module.get(AdminStatsService);
  });

  function setup() {
    prisma.feedback.count
      .mockResolvedValueOnce(6) // total
      .mockResolvedValueOnce(4) // last 7
      .mockResolvedValueOnce(1) // previous 7
      .mockResolvedValueOnce(2); // testimonials
    prisma.feedback.groupBy
      .mockResolvedValueOnce([
        { status: 'new', _count: { _all: 5 } },
        { status: 'done', _count: { _all: 1 } },
      ])
      .mockResolvedValueOnce([
        { type: 'bug', _count: { _all: 3 } },
        { type: 'idea', _count: { _all: 1 } },
        { type: 'praise', _count: { _all: 2 } },
      ])
      .mockResolvedValueOnce([
        { project: 'my-shop', status: 'new', _count: { _all: 4 } },
        { project: 'my-shop', status: 'done', _count: { _all: 1 } },
        { project: 'blog', status: 'new', _count: { _all: 1 } },
      ]);
    const today = new Date().toISOString().slice(0, 10);
    prisma.$queryRaw.mockResolvedValue([{ day: new Date(`${today}T00:00:00Z`), count: BigInt(3) }]);
  }

  it('aggregates totals, status and type, filling missing keys with 0', async () => {
    setup();
    const s = await service.stats();
    expect(s.total).toBe(6);
    expect(s.byStatus).toEqual({ new: 5, triaged: 0, done: 1 });
    expect(s.byType).toEqual({ bug: 3, idea: 1, praise: 2, other: 0 });
    expect(s.last7).toBe(4);
    expect(s.prev7).toBe(1);
  });

  it('counts praise that may be used as a testimonial', async () => {
    setup();
    const s = await service.stats();
    expect(s.testimonials).toBe(2);
    expect(prisma.feedback.count).toHaveBeenNthCalledWith(4, { where: { testimonial_ok: true } });
  });

  it('averages the star ratings to one decimal, ignoring feedback without one', async () => {
    setup();
    const s = await service.stats('my-shop');
    expect(s.rating).toEqual({ average: 4.3, count: 3 });
    expect(prisma.feedback.aggregate).toHaveBeenCalledWith(expect.objectContaining({
      where: { project: 'my-shop', rating: { not: null } },
    }));
  });

  it('reports no average when nobody rated yet', async () => {
    setup();
    prisma.feedback.aggregate.mockResolvedValueOnce({ _avg: { rating: null }, _count: { rating: 0 } });
    expect((await service.stats()).rating).toEqual({ average: null, count: 0 });
  });

  it('groups projects with their new count, largest first', async () => {
    setup();
    const s = await service.stats();
    expect(s.byProject).toEqual([
      { project: 'my-shop', total: 5, new: 4 },
      { project: 'blog', total: 1, new: 1 },
    ]);
  });

  it('returns 14 zero-filled days ending today, with BigInt counts converted', async () => {
    setup();
    const s = await service.stats();
    expect(s.daily).toHaveLength(14);
    expect(s.daily[13]).toEqual({ date: new Date().toISOString().slice(0, 10), count: 3 });
    expect(s.daily[0].count).toBe(0);
  });

  it('applies the project filter to every query', async () => {
    setup();
    await service.stats('my-shop');
    expect(prisma.feedback.count).toHaveBeenNthCalledWith(1, { where: { project: 'my-shop' } });
    expect(prisma.feedback.count).toHaveBeenNthCalledWith(4, { where: { project: 'my-shop', testimonial_ok: true } });
    for (const call of prisma.feedback.groupBy.mock.calls) {
      expect(call[0].where).toEqual({ project: 'my-shop' });
    }
  });
});
