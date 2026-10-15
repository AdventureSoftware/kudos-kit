import {
  IsEnum, IsString, MaxLength, IsEmail, IsOptional,
  IsObject, IsArray, IsNotEmpty, IsBoolean, IsInt, Min, Max,
} from 'class-validator';

export enum FeedbackType {
  BUG = 'bug',
  IDEA = 'idea',
  PRAISE = 'praise',
  OTHER = 'other',
}

export const TESTIMONIAL_NAME_MAX = 80;

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

  /** Optional 1–5 stars. Ignored on bug reports. */
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  /** Praise only: the sender agreed their message may be shown publicly. Ignored for other types. */
  @IsBoolean()
  @IsOptional()
  testimonialOk?: boolean;

  /** Name to show next to the testimonial. Empty = Anonymous. */
  @IsString()
  @IsOptional()
  @MaxLength(TESTIMONIAL_NAME_MAX)
  testimonialName?: string;

  @IsString()
  @IsOptional()
  hp?: string;

  @IsString()
  @IsNotEmpty()
  turnstileToken: string;
}
