import type { PrismaAdminService } from '../prisma/prisma-admin.service';
import { WidgetSetupController } from './widget-setup.controller';

describe('WidgetSetupController', () => {
  it('lists active projects by name, with key and prefix only', async () => {
    const findMany = jest.fn().mockResolvedValue([{ key: 'colorpage', name: 'Colorpage', prefix: 'CP' }]);
    const controller = new WidgetSetupController({ project: { findMany } } as unknown as PrismaAdminService);
    expect(await controller.projects()).toEqual([{ key: 'colorpage', name: 'Colorpage', prefix: 'CP' }]);
    expect(findMany).toHaveBeenCalledWith({
      where: { active: true },
      select: { key: true, name: true, prefix: true },
      orderBy: { name: 'asc' },
    });
  });
});
