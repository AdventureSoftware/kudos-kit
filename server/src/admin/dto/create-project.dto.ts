import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { KEY_PATTERN, NAME_MAX, PREFIX_PATTERN } from '../project-rules';

export class CreateProjectDto {
  @Matches(KEY_PATTERN, {
    message: 'The key may use lower-case letters, digits and dashes (up to 40), starting with a letter or digit.',
  })
  key!: string;

  @IsString()
  @Matches(/\S/, { message: 'Please enter a name.' })
  @MaxLength(NAME_MAX, { message: `The name can be at most ${NAME_MAX} characters.` })
  name!: string;

  /** Optional, like in add-project.sh: without it the database picks one from the key. */
  @IsOptional()
  @Matches(PREFIX_PATTERN, { message: 'The prefix is a letter followed by up to 4 letters or digits, e.g. CP.' })
  prefix?: string;
}
