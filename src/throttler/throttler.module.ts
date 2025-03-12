import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from './throttler-storage-redis.service';
import { CustomThrottlerGuard } from './throttler.guard';
import { RedisModule, RedisService } from '../redis';

/**
 * Throttler module for configuring rate limiting
 * Uses Redis for storage in production and memory store in development
 */
@Module({
  imports: [
    RedisModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: (config: ConfigService, redisService: RedisService) => {
        const isProduction = config.get('NODE_ENV') === 'production';

        return {
          throttlers: [
            {
              ttl: 60, // Time window in seconds
              limit: 60, // Number of requests allowed in the time window
            },
          ],
          storage:
            isProduction && redisService.isClientAvailable()
              ? new ThrottlerStorageRedisService(redisService)
              : undefined,
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    ThrottlerStorageRedisService,
  ],
  exports: [ThrottlerModule],
})
export class AppThrottlerModule {}
