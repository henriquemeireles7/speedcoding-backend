import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';

/**
 * Data Transfer Object for creating a submission
 */
export class CreateSubmissionDto {
  @IsNotEmpty({ message: 'Run ID is required' })
  @IsUUID('4', { message: 'Invalid run ID format' })
  runId: string;

  @IsNotEmpty({ message: 'Video URL is required' })
  @IsString({ message: 'Video URL must be a string' })
  @IsUrl({}, { message: 'Invalid URL format' })
  videoUrl: string;
}
