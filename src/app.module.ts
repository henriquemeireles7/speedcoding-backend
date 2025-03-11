import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RunsModule } from './runs/runs.module';
import { MilestonesModule } from './milestones/milestones.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { VibesModule } from './vibes/vibes.module';
import { PrismaService } from './prisma/prisma.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
  TransformInterceptor,
} from './common';
import { AppConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';

/**
 * Main application module
 */
@Module({
  imports: [
    // Configuration module
    AppConfigModule,

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
    VibesModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    // Global exception filters
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
