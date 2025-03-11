/**
 * Data Transfer Object for milestone responses
 */
export class MilestoneResponseDto {
  id: string;
  runId: string;
  milestoneIndex: number;
  verified: boolean;
  timestamp: Date;
}
