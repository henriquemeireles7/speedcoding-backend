import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheService } from './cache.service';
import { CacheInterceptor } from './cache.interceptor';
import { RedisModule, RedisService } from '../redis';

/**
 * Cache module for configuring Redis connection and providing cache service
 * Uses Redis for distributed caching in production and memory store in development
 */
@Module({
  imports: [
    RedisModule,
    NestCacheModule.registerAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: async (
        configService: ConfigService,
        redisService: RedisService,
      ) => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';

        // Use Redis in production, memory store in development
        if (isProduction && redisService.isClientAvailable()) {
          const redisUrl = configService.get<string>('REDIS_URL');
          if (!redisUrl) {
            throw new Error('REDIS_URL is required in production environment');
          }

          return {
            store: await redisStore({
              url: redisUrl,
              ttl: 60 * 1000, // Default TTL: 1 minute
            }),
            // Add Redis-specific options here
          };
        }

        // Memory store for development
        return {
          ttl: 60 * 1000, // Default TTL: 1 minute
          max: 100, // Maximum number of items in cache
        };
      },
      isGlobal: true,
    }),
  ],
  providers: [CacheService, CacheInterceptor],
  exports: [CacheService, CacheInterceptor],
})
export class CacheModule {}
