import { IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object for leaderboard query parameters
 */
export class LeaderboardQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'Invalid vibe ID format' })
  vibeId?: string;

  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  @Type(() => Number)
  limit?: number = 10;
}
