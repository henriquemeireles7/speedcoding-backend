import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object for starting a new run
 */
export class StartRunDto {
  @IsNotEmpty({ message: 'Vibe ID is required' })
  @IsUUID('4', { message: 'Invalid vibe ID format' })
  vibeId: string;

  @IsOptional()
  @IsArray({ message: 'Tech stack must be an array' })
  @IsString({ each: true, message: 'Each tech stack item must be a string' })
  @Type(() => String)
  techStack?: string[];
}
