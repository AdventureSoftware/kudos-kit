# Admin API Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all DB access and session authority into NestJS; Next.js becomes a pure UI layer calling NestJS admin endpoints with JWT auth.

**Architecture:** Add Prisma ORM to NestJS with two PrismaClient instances (ingest + admin DB roles). Add a new `admin` NestJS module with JWT login and protected CRUD endpoints. Rewrite Next.js admin page and actions to call NestJS over HTTP with a Bearer token stored in an HTTP-only cookie.

**Tech Stack:** NestJS 11, Prisma 6, `@nestjs/jwt`, Next.js 16, TypeScript

---

## File Map

### Server — created
- `server/prisma/schema.prisma` — Prisma schema (Project + Feedback models)
- `server/src/prisma/prisma-ingest.service.ts` — PrismaClient for `feedback_ingest` role
- `server/src/prisma/prisma-admin.service.ts` — PrismaClient for `feedback_admin` role
- `server/src/prisma/prisma.module.ts` — global NestJS module exporting both services
- `server/src/admin/auth.service.ts` — password validation + JWT issuance
- `server/src/admin/auth.service.spec.ts` — AuthService tests
- `server/src/admin/auth.controller.ts` — `POST /v1/admin/login`
- `server/src/admin/jwt-auth.guard.ts` — Bearer token validation guard
- `server/src/admin/admin-feedback.service.ts` — list, listProjects, cycleStatus, delete
- `server/src/admin/admin-feedback.service.spec.ts` — AdminFeedbackService tests
- `server/src/admin/admin-feedback.controller.ts` — guarded CRUD endpoints
- `server/src/admin/admin.module.ts` — admin NestJS module

### Server — modified
- `server/src/config/configuration.ts` — add adminPassword, jwtSecret, DB admin creds
- `server/src/feedback/feedback.service.ts` — use PrismaIngestService instead of DatabaseService
- `server/src/feedback/feedback.service.spec.ts` — mock PrismaIngestService
- `server/src/feedback/feedback.module.ts` — drop DatabaseModule import
- `server/src/app.module.ts` — add PrismaModule + AdminModule
- `server/package.json` — add `@prisma/client`, `@nestjs/jwt`; remove `pg`, `@types/pg`

### Server — deleted
- `server/src/database/database.service.ts`
- `server/src/database/database.service.spec.ts`
- `server/src/database/database.module.ts`

### Client — modified
- `client/src/lib/auth.ts` — replace HMAC session with JWT cookie helpers
- `client/src/app/login/actions.ts` — POST to NestJS, store JWT cookie
- `client/src/app/admin/layout.tsx` — check `admin_token` cookie presence
- `client/src/app/admin/page.tsx` — fetch data from NestJS endpoints
- `client/src/app/admin/actions.ts` — call NestJS with Bearer token

### Client — deleted
- `client/src/lib/db.ts`

---

## Task 1: Install Prisma and create schema

**Files:**
- Create: `server/prisma/schema.prisma`
- Modify: `server/package.json`

- [ ] **Step 1: Install Prisma packages**

```bash
cd server
npm install @prisma/client
npm install --save-dev prisma
```

- [ ] **Step 2: Create `server/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  key      String     @id
  name     String
  active   Boolean    @default(true)
  feedback Feedback[]

  @@map("projects")
}

model Feedback {
  id           BigInt    @id @default(autoincrement())
  project      String
  type         String
  message      String
  email        String?
  user_ctx     Json?
  context      Json?
  console_logs Json?
  errors       Json?
  status       String    @default("new")
  ip           Unsupported("inet")?
  created_at   DateTime  @default(now()) @db.Timestamptz(6)
  projectRef   Project   @relation(fields: [project], references: [key])

  @@index([project, status, created_at(sort: Desc)])
  @@map("feedback")
}
```

- [ ] **Step 3: Generate the Prisma client**

```bash
cd server
npx prisma generate
```

Expected output: `✔ Generated Prisma Client` (no DB connection needed for generate).

- [ ] **Step 4: Commit**

```bash
git add server/prisma/schema.prisma server/package.json server/package-lock.json server/node_modules/.prisma
git commit -m "chore: add Prisma ORM with feedback schema"
```

---

## Task 2: Create PrismaIngestService, PrismaAdminService, PrismaModule

**Files:**
- Create: `server/src/prisma/prisma-ingest.service.ts`
- Create: `server/src/prisma/prisma-admin.service.ts`
- Create: `server/src/prisma/prisma.module.ts`

- [ ] **Step 1: Create `server/src/prisma/prisma-ingest.service.ts`**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaIngestService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const host = process.env.DB_HOST ?? 'localhost';
    const port = process.env.DB_PORT ?? '5432';
    const name = process.env.DB_NAME ?? 'feedback';
    const user = process.env.DB_INGEST_USER ?? 'feedback_ingest';
    const pass = process.env.DB_INGEST_PASSWORD ?? '';
    super({ datasources: { db: { url: `postgresql://${user}:${pass}@${host}:${port}/${name}` } } });
  }

  async onModuleInit(): Promise<void> { await this.$connect(); }
  async onModuleDestroy(): Promise<void> { await this.$disconnect(); }
}
```

- [ ] **Step 2: Create `server/src/prisma/prisma-admin.service.ts`**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaAdminService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const host = process.env.DB_HOST ?? 'localhost';
    const port = process.env.DB_PORT ?? '5432';
    const name = process.env.DB_NAME ?? 'feedback';
    const user = process.env.DB_ADMIN_USER ?? 'feedback_admin';
    const pass = process.env.DB_ADMIN_PASSWORD ?? '';
    super({ datasources: { db: { url: `postgresql://${user}:${pass}@${host}:${port}/${name}` } } });
  }

  async onModuleInit(): Promise<void> { await this.$connect(); }
  async onModuleDestroy(): Promise<void> { await this.$disconnect(); }
}
```

- [ ] **Step 3: Create `server/src/prisma/prisma.module.ts`**

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaIngestService } from './prisma-ingest.service';
import { PrismaAdminService } from './prisma-admin.service';

@Global()
@Module({
  providers: [PrismaIngestService, PrismaAdminService],
  exports: [PrismaIngestService, PrismaAdminService],
})
export class PrismaModule {}
```

- [ ] **Step 4: Commit**

```bash
git add server/src/prisma/
git commit -m "feat: add PrismaIngestService and PrismaAdminService"
```

---

## Task 3: Migrate FeedbackService to PrismaIngestService

**Files:**
- Modify: `server/src/feedback/feedback.service.ts`
- Modify: `server/src/feedback/feedback.service.spec.ts`
- Modify: `server/src/feedback/feedback.module.ts`

- [ ] **Step 1: Write the updated spec first (`server/src/feedback/feedback.service.spec.ts`)**

```typescript
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { PrismaIngestService } from '../prisma/prisma-ingest.service';
import { TurnstileService } from './turnstile.service';
import { NotificationService } from './notification.service';
import { CreateFeedbackDto, FeedbackType } from './dto/create-feedback.dto';

const baseDto: CreateFeedbackDto = {
  project: 'colorpage',
  type: FeedbackType.BUG,
  message: 'Something broke',
  turnstileToken: 'token',
  hp: '',
};

describe('FeedbackService', () => {
  let service: FeedbackService;
  let prisma: { project: { findUnique: jest.Mock }; $queryRaw: jest.Mock };
  let turnstile: jest.Mocked<TurnstileService>;
  let notification: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    prisma = {
      project: { findUnique: jest.fn().mockResolvedValue({ active: true }) },
      $queryRaw: jest.fn().mockResolvedValue([{ id: BigInt(1) }]),
    };
    const module = await Test.createTestingModule({
      providers: [
        FeedbackService,
        { provide: PrismaIngestService, useValue: prisma },
        { provide: TurnstileService, useValue: { verify: jest.fn().mockResolvedValue(true) } },
        { provide: NotificationService, useValue: { notify: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();
    service = module.get(FeedbackService);
    turnstile = module.get(TurnstileService);
    notification = module.get(NotificationService);
  });

  it('silently drops submissions with non-empty honeypot', async () => {
    await service.submit({ ...baseDto, hp: 'bot-fill' }, '1.2.3.4');
    expect(prisma.project.findUnique).not.toHaveBeenCalled();
  });

  it('throws 400 for unknown project', async () => {
    prisma.project.findUnique.mockResolvedValueOnce(null);
    await expect(service.submit(baseDto, '1.2.3.4')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws 400 for inactive project', async () => {
    prisma.project.findUnique.mockResolvedValueOnce({ active: false });
    await expect(service.submit(baseDto, '1.2.3.4')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws 400 when Turnstile fails', async () => {
    turnstile.verify.mockResolvedValueOnce(false);
    await expect(service.submit(baseDto, '1.2.3.4')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('inserts and fires notification on valid submission', async () => {
    await service.submit(baseDto, '1.2.3.4');
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    await new Promise(r => setTimeout(r, 0));
    expect(notification.notify).toHaveBeenCalledWith(
      expect.objectContaining({ project: 'colorpage', type: 'bug' }),
    );
  });
});
```

- [ ] **Step 2: Run the spec to confirm it fails**

```bash
cd server && npx jest feedback.service.spec.ts --no-coverage
```

Expected: FAIL — `FeedbackService` still uses `DatabaseService`.

- [ ] **Step 3: Rewrite `server/src/feedback/feedback.service.ts`**

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaIngestService } from '../prisma/prisma-ingest.service';
import { TurnstileService } from './turnstile.service';
import { NotificationService } from './notification.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaIngestService,
    private turnstile: TurnstileService,
    private notification: NotificationService,
  ) {}

  async submit(dto: CreateFeedbackDto, ip: string): Promise<void> {
    if (dto.hp) return;

    const proj = await this.prisma.project.findUnique({
      where: { key: dto.project },
      select: { active: true },
    });
    if (!proj || !proj.active) throw new BadRequestException('Invalid project');

    const valid = await this.turnstile.verify(dto.turnstileToken, ip);
    if (!valid) throw new BadRequestException('CAPTCHA verification failed');

    const result = await this.prisma.$queryRaw<{ id: bigint }[]>`
      INSERT INTO feedback (project, type, message, email, user_ctx, context, console_logs, errors, ip)
      VALUES (
        ${dto.project}, ${dto.type}, ${dto.message}, ${dto.email ?? null},
        ${dto.user ? JSON.stringify(dto.user) : null}::jsonb,
        ${dto.context ? JSON.stringify(dto.context) : null}::jsonb,
        ${dto.console ? JSON.stringify(dto.console) : null}::jsonb,
        ${dto.errors ? JSON.stringify(dto.errors) : null}::jsonb,
        ${ip}::inet
      )
      RETURNING id
    `;

    this.notification.notify({
      project: dto.project,
      type: dto.type,
      message: dto.message,
      id: result[0]?.id?.toString() ?? '',
    }).catch(() => {});
  }
}
```

- [ ] **Step 4: Update `server/src/feedback/feedback.module.ts`** (remove DatabaseModule import)

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TurnstileService } from './turnstile.service';
import { NotificationService } from './notification.service';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FeedbackController],
  providers: [TurnstileService, NotificationService, FeedbackService],
})
export class FeedbackModule {}
```

- [ ] **Step 5: Run the spec to confirm it passes**

```bash
cd server && npx jest feedback.service.spec.ts --no-coverage
```

Expected: 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add server/src/feedback/feedback.service.ts server/src/feedback/feedback.service.spec.ts server/src/feedback/feedback.module.ts
git commit -m "feat: migrate FeedbackService from pg to Prisma"
```

---

## Task 4: Delete DatabaseModule, DatabaseService, and their spec

**Files:**
- Delete: `server/src/database/database.service.ts`
- Delete: `server/src/database/database.service.spec.ts`
- Delete: `server/src/database/database.module.ts`

- [ ] **Step 1: Delete the three database files**

```bash
rm server/src/database/database.service.ts
rm server/src/database/database.service.spec.ts
rm server/src/database/database.module.ts
rmdir server/src/database
```

- [ ] **Step 2: Run all server tests to confirm nothing is broken**

```bash
cd server && npm test -- --no-coverage
```

Expected: All tests PASS (no references to DatabaseService remain in passing code).

- [ ] **Step 3: Commit**

```bash
git add -u server/src/database/
git commit -m "chore: remove DatabaseService — replaced by Prisma"
```

---

## Task 5: Update server configuration.ts

**Files:**
- Modify: `server/src/config/configuration.ts`

- [ ] **Step 1: Update `server/src/config/configuration.ts`**

```typescript
export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME ?? 'feedback',
  },
  turnstile: {
    secret: process.env.TURNSTILE_SECRET ?? '',
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY ?? '',
    fromEmail: process.env.BREVO_FROM_EMAIL ?? '',
    toEmail: process.env.BREVO_TO_EMAIL ?? '',
  },
  adminUrl: process.env.ADMIN_URL ?? 'http://localhost:3001',
  adminPassword: process.env.ADMIN_PASSWORD ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-prod',
});
```

- [ ] **Step 2: Commit**

```bash
git add server/src/config/configuration.ts
git commit -m "chore: add adminPassword and jwtSecret to server config"
```

---

## Task 6: Add JWT auth (AuthService, AuthController, JwtAuthGuard)

**Files:**
- Create: `server/src/admin/auth.service.ts`
- Create: `server/src/admin/auth.service.spec.ts`
- Create: `server/src/admin/auth.controller.ts`
- Create: `server/src/admin/jwt-auth.guard.ts`

- [ ] **Step 1: Install `@nestjs/jwt`**

```bash
cd server && npm install @nestjs/jwt
```

- [ ] **Step 2: Write the failing spec (`server/src/admin/auth.service.spec.ts`)**

```typescript
import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('correctpass') },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') },
        },
      ],
    }).compile();
    service = module.get(AuthService);
    jwt = module.get(JwtService);
  });

  it('returns token for correct password', async () => {
    const result = await service.login('correctpass');
    expect(result.token).toBe('signed.jwt.token');
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'admin' });
  });

  it('throws UnauthorizedException for wrong password', async () => {
    await expect(service.login('wrongpass')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run spec to confirm it fails**

```bash
cd server && npx jest auth.service.spec.ts --no-coverage
```

Expected: FAIL — `AuthService` not found.

- [ ] **Step 4: Create `server/src/admin/auth.service.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  async login(password: string): Promise<{ token: string }> {
    const expected = this.config.get<string>('adminPassword') ?? '';
    const a = createHmac('sha256', 'kkw-pw').update(password).digest();
    const b = createHmac('sha256', 'kkw-pw').update(expected).digest();
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException();
    }
    const token = await this.jwt.signAsync({ sub: 'admin' });
    return { token };
  }
}
```

- [ ] **Step 5: Run spec to confirm it passes**

```bash
cd server && npx jest auth.service.spec.ts --no-coverage
```

Expected: 2 tests PASS.

- [ ] **Step 6: Create `server/src/admin/auth.controller.ts`**

```typescript
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('v1/admin')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { password: string }): Promise<{ token: string }> {
    return this.auth.login(body.password);
  }
}
```

- [ ] **Step 7: Create `server/src/admin/jwt-auth.guard.ts`**

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    const auth = req.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) return false;
    try {
      await this.jwt.verifyAsync(auth.slice(7), {
        secret: this.config.get<string>('jwtSecret'),
      });
      return true;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add server/src/admin/auth.service.ts server/src/admin/auth.service.spec.ts server/src/admin/auth.controller.ts server/src/admin/jwt-auth.guard.ts server/package.json server/package-lock.json
git commit -m "feat: add JWT auth service and guard"
```

---

## Task 7: Add AdminFeedbackService and AdminFeedbackController

**Files:**
- Create: `server/src/admin/admin-feedback.service.ts`
- Create: `server/src/admin/admin-feedback.service.spec.ts`
- Create: `server/src/admin/admin-feedback.controller.ts`
- Create: `server/src/admin/admin.module.ts`

- [ ] **Step 1: Write the failing spec (`server/src/admin/admin-feedback.service.spec.ts`)**

```typescript
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
```

- [ ] **Step 2: Run spec to confirm it fails**

```bash
cd server && npx jest admin-feedback.service.spec.ts --no-coverage
```

Expected: FAIL — `AdminFeedbackService` not found.

- [ ] **Step 3: Create `server/src/admin/admin-feedback.service.ts`**

```typescript
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
```

- [ ] **Step 4: Run spec to confirm it passes**

```bash
cd server && npx jest admin-feedback.service.spec.ts --no-coverage
```

Expected: 6 tests PASS.

- [ ] **Step 5: Create `server/src/admin/admin-feedback.controller.ts`**

```typescript
import { Controller, Delete, Get, HttpCode, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminFeedbackService } from './admin-feedback.service';

@Controller('v1/admin')
@UseGuards(JwtAuthGuard)
export class AdminFeedbackController {
  constructor(private adminFeedback: AdminFeedbackService) {}

  @Get('feedback')
  async list(@Query() query: { project?: string; status?: string; page?: string }) {
    return this.adminFeedback.list(query);
  }

  @Get('projects')
  async projects(): Promise<string[]> {
    return this.adminFeedback.listProjects();
  }

  @Patch('feedback/:id/status')
  async cycleStatus(@Param('id') id: string): Promise<void> {
    return this.adminFeedback.cycleStatus(id);
  }

  @Delete('feedback/:id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    return this.adminFeedback.delete(id);
  }
}
```

- [ ] **Step 6: Create `server/src/admin/admin.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminFeedbackService } from './admin-feedback.service';
import { AdminFeedbackController } from './admin-feedback.controller';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwtSecret'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, AdminFeedbackController],
  providers: [AuthService, AdminFeedbackService, JwtAuthGuard],
})
export class AdminModule {}
```

- [ ] **Step 7: Commit**

```bash
git add server/src/admin/
git commit -m "feat: add AdminFeedbackService, controller, and AdminModule"
```

---

## Task 8: Wire PrismaModule and AdminModule into AppModule

**Files:**
- Modify: `server/src/app.module.ts`

- [ ] **Step 1: Update `server/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FeedbackModule } from './feedback/feedback.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    PrismaModule,
    FeedbackModule,
    AdminModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 2: Run all server tests**

```bash
cd server && npm test -- --no-coverage
```

Expected: All tests PASS. Count should be 19 existing + 2 (auth) + 6 (admin-feedback) = 27 tests.

- [ ] **Step 3: Remove `pg` and `@types/pg` from server**

```bash
cd server && npm uninstall pg @types/pg
```

- [ ] **Step 4: Commit**

```bash
git add server/src/app.module.ts server/package.json server/package-lock.json
git commit -m "feat: wire PrismaModule and AdminModule into AppModule"
```

---

## Task 9: Rewrite client auth.ts

**Files:**
- Modify: `client/src/lib/auth.ts`

- [ ] **Step 1: Rewrite `client/src/lib/auth.ts`**

Replace the entire file with JWT cookie helpers:

```typescript
'server only'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE = 'admin_token';
const MAX_AGE = 24 * 60 * 60;

export async function setAuthToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
}

export async function getAuthToken(): Promise<string | null> {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

export async function deleteAuthToken(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function requireAuthToken(): Promise<string> {
  const token = await getAuthToken();
  if (!token) redirect('/login');
  return token;
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/lib/auth.ts
git commit -m "feat: replace HMAC session auth with JWT cookie helpers in client"
```

---

## Task 10: Rewrite client login/actions.ts and admin/layout.tsx

**Files:**
- Modify: `client/src/app/login/actions.ts`
- Modify: `client/src/app/admin/layout.tsx`

- [ ] **Step 1: Rewrite `client/src/app/login/actions.ts`**

```typescript
'use server'

import { redirect } from 'next/navigation';
import { setAuthToken, deleteAuthToken } from '@/lib/auth';

const API = process.env.NESTJS_API_URL ?? 'http://localhost:3000';

export async function loginAction(formData: FormData): Promise<void> {
  const password = formData.get('password');
  if (typeof password !== 'string') redirect('/login?error=1');

  let token: string;
  try {
    const res = await fetch(`${API}/v1/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) redirect('/login?error=1');
    const body = await res.json() as { token: string };
    token = body.token;
  } catch {
    redirect('/login?error=1');
  }

  await setAuthToken(token);
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await deleteAuthToken();
  redirect('/login');
}
```

- [ ] **Step 2: Rewrite `client/src/app/admin/layout.tsx`**

```typescript
import { requireAuthToken } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuthToken();
  return <>{children}</>;
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/app/login/actions.ts client/src/app/admin/layout.tsx
git commit -m "feat: update client login to call NestJS JWT endpoint"
```

---

## Task 11: Rewrite client admin/page.tsx

**Files:**
- Modify: `client/src/app/admin/page.tsx`

- [ ] **Step 1: Rewrite `client/src/app/admin/page.tsx`**

```typescript
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { toggleStatusAction, deleteRowAction, logoutAction } from './actions';

const API = process.env.NESTJS_API_URL ?? 'http://localhost:3000';

interface FeedbackRow {
  id: string;
  project: string;
  type: 'bug' | 'idea' | 'other';
  message: string;
  email: string | null;
  user_ctx: Record<string, unknown> | null;
  context: Record<string, unknown> | null;
  status: 'new' | 'triaged' | 'done';
  created_at: string;
}

interface FeedbackListResponse {
  rows: FeedbackRow[];
  total: number;
  page: number;
  totalPages: number;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const token = (await cookies()).get('admin_token')?.value;
  if (!token) redirect('/login');

  const qs = new URLSearchParams();
  if (params.project) qs.set('project', params.project);
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', params.page);

  const headers = { Authorization: `Bearer ${token}` };

  const [feedbackRes, projectsRes] = await Promise.all([
    fetch(`${API}/v1/admin/feedback?${qs}`, { headers, cache: 'no-store' }),
    fetch(`${API}/v1/admin/projects`, { headers, cache: 'no-store' }),
  ]);

  if (feedbackRes.status === 401 || projectsRes.status === 401) redirect('/login');

  const { rows, page, totalPages } = await feedbackRes.json() as FeedbackListResponse;
  const projects = await projectsRes.json() as string[];

  const project = params.project ?? '';
  const status = params.status ?? '';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Feedback</h1>
        <form action={logoutAction}>
          <button type="submit" style={{ fontSize: 13, padding: '5px 12px', cursor: 'pointer' }}>Sign out</button>
        </form>
      </div>

      <form style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select name="project" defaultValue={project} style={{ padding: '6px 10px', fontSize: 13, borderRadius: 4, border: '1px solid #e5e5e5' }}>
          <option value="">All projects</option>
          {projects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select name="status" defaultValue={status} style={{ padding: '6px 10px', fontSize: 13, borderRadius: 4, border: '1px solid #e5e5e5' }}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="triaged">Triaged</option>
          <option value="done">Done</option>
        </select>
        <button type="submit" style={{ padding: '6px 14px', fontSize: 13, background: '#111', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Filter</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e5e5', textAlign: 'left' }}>
            <th style={{ padding: '8px 12px' }}>Type</th>
            <th style={{ padding: '8px 12px' }}>Project</th>
            <th style={{ padding: '8px 12px' }}>Email</th>
            <th style={{ padding: '8px 12px' }}>Message</th>
            <th style={{ padding: '8px 12px' }}>Status</th>
            <th style={{ padding: '8px 12px' }}>Created</th>
            <th style={{ padding: '8px 12px' }}>URL</th>
            <th style={{ padding: '8px 12px' }}>Build</th>
            <th style={{ padding: '8px 12px' }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '8px 12px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: row.type === 'bug' ? '#fee2e2' : row.type === 'idea' ? '#dbeafe' : '#f3f4f6',
                  color: row.type === 'bug' ? '#991b1b' : row.type === 'idea' ? '#1d4ed8' : '#374151',
                }}>
                  {row.type}
                </span>
              </td>
              <td style={{ padding: '8px 12px', color: '#666' }}>{row.project}</td>
              <td style={{ padding: '8px 12px', color: '#666', fontSize: 12 }}>{row.email ?? '—'}</td>
              <td style={{ padding: '8px 12px', maxWidth: 300 }}>
                <span title={row.message}>{row.message.slice(0, 80)}{row.message.length > 80 ? '…' : ''}</span>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <form action={toggleStatusAction.bind(null, row.id)}>
                  <button type="submit" style={{
                    padding: '2px 8px', fontSize: 11, borderRadius: 4, cursor: 'pointer', border: '1px solid #ccc',
                    background: row.status === 'new' ? '#fef9c3' : row.status === 'triaged' ? '#dbeafe' : '#dcfce7',
                  }}>
                    {row.status}
                  </button>
                </form>
              </td>
              <td style={{ padding: '8px 12px', color: '#666', whiteSpace: 'nowrap' }}>
                {new Date(row.created_at).toLocaleDateString()}
              </td>
              <td style={{ padding: '8px 12px', maxWidth: 160 }}>
                <span title={String(row.context?.url ?? '')} style={{ color: '#666', fontSize: 12 }}>
                  {String(row.context?.url ?? '').slice(0, 40)}
                </span>
              </td>
              <td style={{ padding: '8px 12px', color: '#666', fontSize: 12 }}>
                {String(row.context?.build ?? '')}
              </td>
              <td style={{ padding: '8px 12px' }}>
                <form action={deleteRowAction.bind(null, row.id)}>
                  <button type="submit" style={{ fontSize: 12, padding: '3px 8px', cursor: 'pointer', color: '#c00', border: '1px solid #fca5a5', borderRadius: 4, background: '#fff' }}>
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#999' }}>No feedback yet</td></tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a
              key={p}
              href={`/admin?${new URLSearchParams({ ...(project && { project }), ...(status && { status }), page: String(p) })}`}
              style={{
                padding: '4px 10px', fontSize: 13, borderRadius: 4, border: '1px solid #e5e5e5',
                background: p === page ? '#111' : '#fff', color: p === page ? '#fff' : '#111', textDecoration: 'none',
              }}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/app/admin/page.tsx
git commit -m "feat: admin page fetches data from NestJS instead of direct DB"
```

---

## Task 12: Rewrite client admin/actions.ts

**Files:**
- Modify: `client/src/app/admin/actions.ts`

- [ ] **Step 1: Rewrite `client/src/app/admin/actions.ts`**

```typescript
'use server'

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API = process.env.NESTJS_API_URL ?? 'http://localhost:3000';

async function getToken(): Promise<string> {
  const token = (await cookies()).get('admin_token')?.value;
  if (!token) redirect('/login');
  return token;
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete('admin_token');
  redirect('/login');
}

export async function toggleStatusAction(id: string): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${API}/v1/admin/feedback/${id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) redirect('/login');
  revalidatePath('/admin');
}

export async function deleteRowAction(id: string): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${API}/v1/admin/feedback/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) redirect('/login');
  revalidatePath('/admin');
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/app/admin/actions.ts
git commit -m "feat: admin actions call NestJS endpoints with JWT"
```

---

## Task 13: Remove db.ts, pg, and update client env

**Files:**
- Delete: `client/src/lib/db.ts`
- Modify: `client/package.json`

- [ ] **Step 1: Delete `client/src/lib/db.ts`**

```bash
rm client/src/lib/db.ts
```

- [ ] **Step 2: Remove `pg` and `@types/pg` from client**

```bash
cd client && npm uninstall pg @types/pg
```

- [ ] **Step 3: Update `client/.env.local`**

Remove `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`. Add:

```
NESTJS_API_URL=http://localhost:3000
```

- [ ] **Step 4: Update `server/.env`**

Add the new variables:

```
ADMIN_PASSWORD=<your-admin-password>
JWT_SECRET=<32+-char-random-string>
DB_ADMIN_USER=feedback_admin
DB_ADMIN_PASSWORD=<feedback_admin-role-password>
TURNSTILE_SECRET=1x0000000000000000000000000000000AA
```

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/ client/package.json client/package-lock.json
git commit -m "chore: remove pg from client, delete db.ts"
```

---

## Task 14: Run all tests and smoke test

- [ ] **Step 1: Run all server tests**

```bash
cd server && npm test -- --no-coverage
```

Expected: 27 tests PASS, 0 failures.

- [ ] **Step 2: Build the client to catch TypeScript errors**

```bash
cd client && npm run build
```

Expected: Build succeeds, no type errors.

- [ ] **Step 3: Smoke test — start both servers**

Terminal 1:
```bash
cd server && npm run start:dev
```

Terminal 2:
```bash
cd client && npm run dev
```

- [ ] **Step 4: Verify login**

Open `http://localhost:3001/login`. Enter the password from `ADMIN_PASSWORD` in `server/.env`. Confirm redirect to `/admin` and that the `admin_token` cookie is set (check browser DevTools → Application → Cookies).

- [ ] **Step 5: Verify admin page**

Confirm the feedback table loads (even if empty). Check browser Network tab — requests should go to `localhost:3000/v1/admin/feedback`, not to Postgres directly.

- [ ] **Step 6: Verify status toggle and delete**

If the DB has rows, click a status badge to cycle it. Click Delete on a row. Both should work without errors.

- [ ] **Step 7: Verify token expiry redirect**

In DevTools, delete the `admin_token` cookie. Refresh `/admin`. Confirm redirect to `/login`.

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "feat: complete admin API refactor — NestJS owns all DB access and JWT auth"
```
