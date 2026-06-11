import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, unknown> = {
                'database.host': 'localhost',
                'database.port': 5432,
                'database.name': 'feedback_test',
                'database.user': 'test',
                'database.password': 'test',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();
    service = module.get(DatabaseService);
    service.onModuleInit();
    // Patch pool to avoid real connections
    const pool = (service as any).pool;
    jest.spyOn(pool, 'end').mockResolvedValue(undefined);
    jest.spyOn(pool, 'query').mockResolvedValue({ rows: [], rowCount: 0 } as any);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('query delegates to pool', async () => {
    const result = await service.query('SELECT 1');
    expect(result.rows).toEqual([]);
  });
});
