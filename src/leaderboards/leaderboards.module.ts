import { Module } from '@nestjs/common';
import { LeaderboardsController } from './leaderboards.controller';
import { LeaderboardsService } from './leaderboards.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Module for managing leaderboards
 */
@Module({
  controllers: [LeaderboardsController],
  providers: [LeaderboardsService, PrismaService],
  exports: [LeaderboardsService],
})
export class LeaderboardsModule {}
