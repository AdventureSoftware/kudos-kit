import { ProjectsController } from './projects.controller';
import type { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  const roles = (method?: keyof ProjectsController) =>
    Reflect.getMetadata('ORG_ROLES', method ? ProjectsController.prototype[method] : ProjectsController);

  it('lets every team member see the list', () => {
    expect(roles()).toEqual(['owner', 'admin', 'member']);
  });

  it('lets only owners and admins add or change projects', () => {
    expect(roles('create')).toEqual(['owner', 'admin']);
    expect(roles('update')).toEqual(['owner', 'admin']);
  });

  it('passes calls to the service', async () => {
    const service = { list: jest.fn().mockResolvedValue([]), create: jest.fn(), update: jest.fn() };
    const controller = new ProjectsController(service as unknown as ProjectsService);
    await controller.list();
    await controller.create({ key: 'a', name: 'A' });
    await controller.update('a', { active: false });
    expect(service.create).toHaveBeenCalledWith({ key: 'a', name: 'A' });
    expect(service.update).toHaveBeenCalledWith('a', { active: false });
  });
});
