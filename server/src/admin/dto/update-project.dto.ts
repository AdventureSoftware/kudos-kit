import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { NAME_MAX } from '../project-rules';

/** Only the name and active can change. Key and prefix are fixed (any sent are dropped). */
export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'Please enter a name.' })
  @MaxLength(NAME_MAX, { message: `The name can be at most ${NAME_MAX} characters.` })
  name?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
