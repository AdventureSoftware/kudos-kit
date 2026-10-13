/**
 * Stand-in for @thallesp/nestjs-better-auth in unit tests.
 *
 * Better Auth ships only ES modules, which this project's Jest setup (ts-jest, CommonJS)
 * cannot load. Unit tests never exercise login, so the decorators here do nothing beyond
 * attaching the same metadata keys. Real authentication is covered by e2e tests.
 * Wired up through "moduleNameMapper" in the Jest config in package.json.
 */
import { SetMetadata, createParamDecorator, type CanActivate } from '@nestjs/common';

export const AllowAnonymous = () => SetMetadata('PUBLIC', true);
export const Public = AllowAnonymous;
export const OptionalAuth = () => SetMetadata('OPTIONAL', true);
export const Optional = OptionalAuth;
export const Roles = (roles: string[]) => SetMetadata('ROLES', roles);
export const OrgRoles = (roles: string[]) => SetMetadata('ORG_ROLES', roles);
export const Session = createParamDecorator(() => undefined);
export const Hook = (): ClassDecorator => () => undefined;
export const BeforeHook = (path?: string) => SetMetadata('BEFORE_HOOK', path ?? true);
export const AfterHook = (path?: string) => SetMetadata('AFTER_HOOK', path ?? true);

export class AuthGuard implements CanActivate {
  canActivate() {
    return true;
  }
}
export class AuthService {}
export class AuthModule {}
export type UserSession = { user: Record<string, unknown>; session: Record<string, unknown> };
