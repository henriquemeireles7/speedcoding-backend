/**
 * Data Transfer Object for submission responses
 */
export class SubmissionResponseDto {
  id: string;
  runId: string;
  videoUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
