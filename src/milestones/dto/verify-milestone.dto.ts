import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Data Transfer Object for verifying a milestone
 */
export class VerifyMilestoneDto {
  @IsNotEmpty({ message: 'Run ID is required' })
  @IsUUID('4', { message: 'Invalid run ID format' })
  runId: string;
}
