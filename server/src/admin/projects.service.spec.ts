import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { PrismaAdminService } from '../prisma/prisma-admin.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

const row = (over: Partial<{ key: string; name: string; prefix: string; active: boolean; n: number }> = {}) => ({
  key: over.key ?? 'my-shop',
  name: over.name ?? 'My Shop',
  prefix: over.prefix ?? 'MS',
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
      { key: 'my-shop', name: 'My Shop', prefix: 'MS', active: true, reports: 12 },
    ]);
    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ active: 'desc' }, { name: 'asc' }] }),
    );
  });

  it('adds a project with an upper-case prefix and a tidy name', async () => {
    prisma.project.create.mockResolvedValue(row());
    const result = await service.create({ key: 'my-shop', name: '  My   Shop ', prefix: 'ms' });
    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { key: 'my-shop', name: 'My Shop', active: true, prefix: 'MS' } }),
    );
    expect(result.reports).toBe(0);
  });

  it('lets the database pick a prefix when none is given', async () => {
    prisma.project.create.mockResolvedValue(row({ prefix: 'CO' }));
    await service.create({ key: 'my-shop', name: 'My Shop' });
    expect(prisma.project.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ prefix: '' }) }));
  });

  it('refuses a key that is already used', async () => {
    prisma.project.findUnique.mockImplementation(async ({ where }) => (where.key ? { name: 'My Shop' } : null));
    await expect(service.create({ key: 'my-shop', name: 'Again', prefix: 'AG' })).rejects.toThrow(
      new ConflictException('The key “my-shop” is already used by My Shop.'),
    );
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it('refuses a prefix that is already used, whatever its case', async () => {
    prisma.project.findUnique.mockImplementation(async ({ where }) => (where.prefix === 'MS' ? { name: 'My Shop' } : null));
    await expect(service.create({ key: 'other', name: 'Other', prefix: 'ms' })).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it('answers 409 when the same key or prefix is added at the same moment', async () => {
    prisma.project.create.mockRejectedValue(prismaError('P2002'));
    await expect(service.create({ key: 'new', name: 'New', prefix: 'NW' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('renames a project', async () => {
    prisma.project.update.mockResolvedValue(row({ name: 'My Shop Pro' }));
    await service.update('my-shop', { name: ' My Shop Pro ' });
    expect(prisma.project.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { key: 'my-shop' }, data: { name: 'My Shop Pro' } }),
    );
  });

  it('turns a project off, changing nothing else', async () => {
    prisma.project.update.mockResolvedValue(row({ active: false }));
    await service.update('my-shop', { active: false });
    expect(prisma.project.update).toHaveBeenCalledWith(expect.objectContaining({ data: { active: false } }));
  });

  it('refuses an empty change', async () => {
    await expect(service.update('my-shop', {})).rejects.toBeInstanceOf(BadRequestException);
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
    expect(await errors(CreateProjectDto, { key: 'my-shop', name: 'My Shop', prefix: 'MS' })).toEqual([]);
    expect(await errors(CreateProjectDto, { key: 'my-app-2', name: 'My app' })).toEqual([]);
  });

  it('rejects bad keys, names and prefixes', async () => {
    expect(await errors(CreateProjectDto, { key: 'Color Page', name: 'x', prefix: 'MS' })).toEqual(['key']);
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
