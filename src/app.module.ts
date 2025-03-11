import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RunsModule } from './runs/runs.module';
import { MilestonesModule } from './milestones/milestones.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { PrismaService } from './prisma/prisma.service';
import { ThrottlerModule } from '@nestjs/throttler';

/**
 * Main application module
 */
@Module({
  imports: [
    // Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        ttl: 60, // Time-to-live in seconds
        limit: 10, // Number of requests allowed in the TTL window
      },
    ]),
    AuthModule,
    RunsModule,
    MilestonesModule,
    SubmissionsModule,
    LeaderboardsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
