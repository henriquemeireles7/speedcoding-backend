import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Data Transfer Object for ending a run
 */
export class EndRunDto {
  @IsNotEmpty({ message: 'Run ID is required' })
  @IsUUID('4', { message: 'Invalid run ID format' })
  runId: string;
}
