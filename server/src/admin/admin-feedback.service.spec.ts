import { Test } from '@nestjs/testing';
import { AdminFeedbackService } from './admin-feedback.service';
import { PrismaAdminService } from '../prisma/prisma-admin.service';

const mockPrisma = () => ({
  feedback: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
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
      { id: BigInt(1), project: 'colorpage', type: 'bug', message: 'test',
        email: null, user_ctx: null, context: null, status: 'new', created_at: new Date() },
    ]);
    (prisma.feedback.count as jest.Mock).mockResolvedValue(1);
    const result = await service.list({});
    expect(result.rows[0].id).toBe('1');
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
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

  it('deletes feedback by id', async () => {
    (prisma.feedback.delete as jest.Mock).mockResolvedValue({});
    await service.delete('5');
    expect(prisma.feedback.delete).toHaveBeenCalledWith({ where: { id: BigInt(5) } });
  });

  it('returns project keys ordered alphabetically', async () => {
    (prisma.project.findMany as jest.Mock).mockResolvedValue([
      { key: 'bizpage' }, { key: 'colorpage' },
    ]);
    const result = await service.listProjects();
    expect(result).toEqual(['bizpage', 'colorpage']);
  });
});
