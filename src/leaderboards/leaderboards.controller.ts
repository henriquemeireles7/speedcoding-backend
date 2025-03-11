import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';
import { LeaderboardQueryDto, LeaderboardEntryDto } from './dto';

/**
 * Controller for managing leaderboards
 */
@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private leaderboardsService: LeaderboardsService) {}

  /**
   * Get leaderboard entries
   * @param queryDto Query parameters
   * @returns List of leaderboard entries
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getLeaderboard(
    @Query() queryDto: LeaderboardQueryDto,
  ): Promise<LeaderboardEntryDto[]> {
    return this.leaderboardsService.getLeaderboard(queryDto);
  }
}
