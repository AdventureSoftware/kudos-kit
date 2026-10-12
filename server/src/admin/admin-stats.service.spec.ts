import { Test } from '@nestjs/testing';
import { AdminStatsService } from './admin-stats.service';
import { PrismaAdminService } from '../prisma/prisma-admin.service';

const mockPrisma = () => ({
  feedback: {
    count: jest.fn(),
    groupBy: jest.fn(),
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
      .mockResolvedValueOnce(1); // previous 7
    prisma.feedback.groupBy
      .mockResolvedValueOnce([
        { status: 'new', _count: { _all: 5 } },
        { status: 'done', _count: { _all: 1 } },
      ])
      .mockResolvedValueOnce([
        { type: 'bug', _count: { _all: 5 } },
        { type: 'idea', _count: { _all: 1 } },
      ])
      .mockResolvedValueOnce([
        { project: 'colorpage', status: 'new', _count: { _all: 4 } },
        { project: 'colorpage', status: 'done', _count: { _all: 1 } },
        { project: 'bizpage', status: 'new', _count: { _all: 1 } },
      ]);
    const today = new Date().toISOString().slice(0, 10);
    prisma.$queryRaw.mockResolvedValue([{ day: new Date(`${today}T00:00:00Z`), count: BigInt(3) }]);
  }

  it('aggregates totals, status and type, filling missing keys with 0', async () => {
    setup();
    const s = await service.stats();
    expect(s.total).toBe(6);
    expect(s.byStatus).toEqual({ new: 5, triaged: 0, done: 1 });
    expect(s.byType).toEqual({ bug: 5, idea: 1, other: 0 });
    expect(s.last7).toBe(4);
    expect(s.prev7).toBe(1);
  });

  it('groups projects with their new count, largest first', async () => {
    setup();
    const s = await service.stats();
    expect(s.byProject).toEqual([
      { project: 'colorpage', total: 5, new: 4 },
      { project: 'bizpage', total: 1, new: 1 },
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
    await service.stats('colorpage');
    expect(prisma.feedback.count).toHaveBeenNthCalledWith(1, { where: { project: 'colorpage' } });
    for (const call of prisma.feedback.groupBy.mock.calls) {
      expect(call[0].where).toEqual({ project: 'colorpage' });
    }
  });
});
