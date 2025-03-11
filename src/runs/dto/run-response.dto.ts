/**
 * Data Transfer Object for run responses
 */
export class RunResponseDto {
  id: string;
  userId: string;
  vibeId?: string;
  techStack?: string[];
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  totalTimeInSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data Transfer Object for run summary responses (used in listings)
 */
export class RunSummaryDto {
  id: string;
  vibeId?: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}
