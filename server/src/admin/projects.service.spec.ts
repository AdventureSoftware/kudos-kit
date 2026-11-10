import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { PrismaAdminService } from '../prisma/prisma-admin.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

const row = (over: Partial<{ key: string; name: string; prefix: string; active: boolean; n: number }> = {}) => ({
  key: over.key ?? 'colorpage',
  name: over.name ?? 'Colorpage',
  prefix: over.prefix ?? 'CP',
  active: over.active ?? true,
  _count: { feedback: over.n ?? 0 },
});

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('db error', { code, clientVersion: 'test' });

const makePrisma = () => ({
  project: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest.fn(),
  },
});

describe('ProjectsService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: ProjectsService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new ProjectsService(prisma as unknown as PrismaAdminService);
  });

  it('lists projects with their number of reports, active ones first', async () => {
    prisma.project.findMany.mockResolvedValue([row({ n: 12 })]);
    expect(await service.list()).toEqual([
      { key: 'colorpage', name: 'Colorpage', prefix: 'CP', active: true, reports: 12 },
    ]);
    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ active: 'desc' }, { name: 'asc' }] }),
    );
  });

  it('adds a project with an upper-case prefix and a tidy name', async () => {
    prisma.project.create.mockResolvedValue(row());
    const result = await service.create({ key: 'colorpage', name: '  Color   page ', prefix: 'cp' });
    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { key: 'colorpage', name: 'Color page', active: true, prefix: 'CP' } }),
    );
    expect(result.reports).toBe(0);
  });

  it('lets the database pick a prefix when none is given', async () => {
    prisma.project.create.mockResolvedValue(row({ prefix: 'CO' }));
    await service.create({ key: 'colorpage', name: 'Colorpage' });
    expect(prisma.project.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ prefix: '' }) }));
  });

  it('refuses a key that is already used', async () => {
    prisma.project.findUnique.mockImplementation(async ({ where }) => (where.key ? { name: 'Colorpage' } : null));
    await expect(service.create({ key: 'colorpage', name: 'Again', prefix: 'AG' })).rejects.toThrow(
      new ConflictException('The key “colorpage” is already used by Colorpage.'),
    );
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it('refuses a prefix that is already used, whatever its case', async () => {
    prisma.project.findUnique.mockImplementation(async ({ where }) => (where.prefix === 'CP' ? { name: 'Colorpage' } : null));
    await expect(service.create({ key: 'other', name: 'Other', prefix: 'cp' })).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it('answers 409 when the same key or prefix is added at the same moment', async () => {
    prisma.project.create.mockRejectedValue(prismaError('P2002'));
    await expect(service.create({ key: 'new', name: 'New', prefix: 'NW' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('renames a project', async () => {
    prisma.project.update.mockResolvedValue(row({ name: 'Colorpage AI' }));
    await service.update('colorpage', { name: ' Colorpage AI ' });
    expect(prisma.project.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { key: 'colorpage' }, data: { name: 'Colorpage AI' } }),
    );
  });

  it('turns a project off, changing nothing else', async () => {
    prisma.project.update.mockResolvedValue(row({ active: false }));
    await service.update('colorpage', { active: false });
    expect(prisma.project.update).toHaveBeenCalledWith(expect.objectContaining({ data: { active: false } }));
  });

  it('refuses an empty change', async () => {
    await expect(service.update('colorpage', {})).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.project.update).not.toHaveBeenCalled();
  });

  it('answers 404 for an unknown or malformed key', async () => {
    prisma.project.update.mockRejectedValue(prismaError('P2025'));
    await expect(service.update('nope', { active: true })).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.update('../Bad Key', { active: true })).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('project DTOs', () => {
  const errors = async <T extends object>(cls: new () => T, body: object) =>
    (await validate(plainToInstance(cls, body))).map((e) => e.property);

  it('accepts what add-project.sh accepts', async () => {
    expect(await errors(CreateProjectDto, { key: 'colorpage', name: 'Colorpage', prefix: 'CP' })).toEqual([]);
    expect(await errors(CreateProjectDto, { key: 'my-app-2', name: 'My app' })).toEqual([]);
  });

  it('rejects bad keys, names and prefixes', async () => {
    expect(await errors(CreateProjectDto, { key: 'Color Page', name: 'x', prefix: 'CP' })).toEqual(['key']);
    expect(await errors(CreateProjectDto, { key: '-x', name: 'x' })).toEqual(['key']);
    expect(await errors(CreateProjectDto, { key: 'x', name: '   ' })).toEqual(['name']);
    expect(await errors(CreateProjectDto, { key: 'x', name: 'x', prefix: '1CP' })).toEqual(['prefix']);
    expect(await errors(CreateProjectDto, { key: 'x', name: 'x', prefix: 'TOOLONG' })).toEqual(['prefix']);
  });

  it('only lets name and active change', async () => {
    expect(await errors(UpdateProjectDto, { active: 'yes' })).toEqual(['active']);
    expect(await errors(UpdateProjectDto, { name: '' })).toEqual(['name']);
    expect(await errors(UpdateProjectDto, { active: false })).toEqual([]);
  });
});
