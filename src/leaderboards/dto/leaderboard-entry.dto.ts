/**
 * Data Transfer Object for leaderboard entries
 */
export class LeaderboardEntryDto {
  runId: string;
  userId: string;
  username: string;
  vibeId?: string;
  vibeName?: string;
  totalTimeInSeconds: number;
  submissionStatus: string;
  completedAt: Date;
}
