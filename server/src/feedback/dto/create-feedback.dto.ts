import {
  IsEnum, IsString, MaxLength, IsEmail, IsOptional,
  IsObject, IsArray, IsNotEmpty,
} from 'class-validator';

export enum FeedbackType {
  BUG = 'bug',
  IDEA = 'idea',
  OTHER = 'other',
}

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  project: string;

  @IsEnum(FeedbackType)
  type: FeedbackType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsObject()
  @IsOptional()
  user?: { id?: string; plan?: string };

  @IsObject()
  @IsOptional()
  context?: Record<string, unknown>;

  @IsArray()
  @IsOptional()
  console?: Array<{ t: number; level: string; msg: string }>;

  @IsArray()
  @IsOptional()
  errors?: Array<{ message: string; stack?: string; filename?: string; lineno?: number }>;

  @IsString()
  @IsOptional()
  hp?: string;

  @IsString()
  @IsNotEmpty()
  turnstileToken: string;
}
