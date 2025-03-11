import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardQueryDto, LeaderboardEntryDto } from './dto';
import { Status } from '@prisma/client';

/**
 * Service for managing leaderboards
 */
@Injectable()
export class LeaderboardsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get leaderboard entries
   * @param queryDto Query parameters
   * @returns List of leaderboard entries
   */
  async getLeaderboard(
    queryDto: LeaderboardQueryDto,
  ): Promise<LeaderboardEntryDto[]> {
    const { vibeId, limit = 10 } = queryDto;

    // Build the where clause for filtering
    const where: any = {
      completed: true,
      submissions: {
        some: {
          status: Status.APPROVED,
        },
      },
    };

    // Add vibe filter if provided
    if (vibeId) {
      where.vibeId = vibeId;
    }

    // Get runs with their users, vibes, and submissions
    const runs = await this.prisma.run.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        vibe: {
          select: {
            id: true,
            name: true,
          },
        },
        submissions: {
          where: {
            status: Status.APPROVED,
          },
          take: 1,
        },
      },
      orderBy: {
        totalTimeInSeconds: 'asc',
      },
      take: limit,
    });

    // Map the runs to leaderboard entries
    return runs.map((run) => ({
      runId: run.id,
      userId: run.userId,
      username: run.user.username,
      vibeId: run.vibeId || undefined,
      vibeName: run.vibe?.name || undefined,
      totalTimeInSeconds: run.totalTimeInSeconds || 0,
      submissionStatus: run.submissions[0]?.status || 'NONE',
      completedAt: run.endTime || new Date(),
    }));
  }
}
