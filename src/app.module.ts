import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
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
import { MetricsModule, MetricsInterceptor } from './metrics';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './throttler/throttler.guard';
import { PrismaModule } from './prisma/prisma.module';

/**
 * Main application module
 * Configures global providers and imports feature modules
 */
@Module({
  imports: [
    SentryModule.forRoot(),
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AppConfigModule,

    // Database
    PrismaModule,

    // Static file serving
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Infrastructure modules
    RedisModule,
    CacheModule,
    LoggingModule,
    AppThrottlerModule,
    MetricsModule,

    // Health checks
    HealthModule,

    // Feature modules
    UsersModule,
    AuthModule,
    // Uncomment these as they are implemented
    // RunsModule,
    // SubmissionsModule,
    // VerifyModule,
    // LeaderboardsModule,
    // VibesModule,

    // Throttler module
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        throttlers: [{ ttl: 60, limit: 60 }], // Default throttler settings
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global exception filters
    {
      provide: APP_FILTER,
      useClass: SentryExceptionFilter,
    },
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
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
