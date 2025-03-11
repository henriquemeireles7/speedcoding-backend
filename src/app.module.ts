import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { CacheModule } from './cache/cache.module';
import { LoggingModule } from './logging/logging.module';
import { AppThrottlerModule } from './throttler/throttler.module';
import { LoggingInterceptor } from './logging/logging.interceptor';
import { CacheInterceptor } from './cache/cache.interceptor';
import { RedisModule } from './redis/redis.module';

/**
 * Main application module
 * Configures global providers and imports feature modules
 */
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AppConfigModule,

    // Infrastructure modules
    RedisModule,
    CacheModule,
    LoggingModule,
    AppThrottlerModule,

    // Health checks
    HealthModule,

    // Feature modules
    // Uncomment these as they are implemented
    // AuthModule,
    // RunsModule,
    // SubmissionsModule,
    // VerifyModule,
    // LeaderboardsModule,
    // VibesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
