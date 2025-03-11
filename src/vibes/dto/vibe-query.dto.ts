import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object for vibe query parameters
 */
export class VibeQueryDto {
  @ApiProperty({
    description: 'Maximum number of vibes to return',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    description: 'Number of vibes to skip',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Offset must be an integer' })
  @Min(0, { message: 'Offset must be at least 0' })
  @Type(() => Number)
  offset?: number = 0;
}
