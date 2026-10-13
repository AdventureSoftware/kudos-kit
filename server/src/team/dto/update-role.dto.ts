import { IsIn } from 'class-validator';
import { ASSIGNABLE_ROLES, type AssignableRole } from '../team-rules';

export class UpdateRoleDto {
  @IsIn(ASSIGNABLE_ROLES)
  role!: AssignableRole;
}
