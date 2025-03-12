import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from '../redis/redis.service';

/**
 * Interface matching the ThrottlerStorageRecord from @nestjs/throttler
 */
interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

/**
 * Redis storage service for throttler
 * Implements ThrottlerStorage interface for Redis
 */
@Injectable()
export class ThrottlerStorageRedisService implements ThrottlerStorage {
  private readonly logger = new Logger(ThrottlerStorageRedisService.name);

  constructor(private redisService: RedisService) {}

  /**
   * Increment a throttle record
   * @param key Record key
   * @param ttl Time to live in seconds
   * @param limit Maximum number of requests allowed
   * @param blockDuration Duration to block if limit is exceeded
   * @returns ThrottlerStorageRecord with hit count and expiration info
   */
  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
  ): Promise<ThrottlerStorageRecord> {
    try {
      const client = this.redisService.getClient();
      if (!client) {
        this.logger.warn('Redis client not available, using in-memory storage');
        return {
          totalHits: 1,
          timeToExpire: ttl * 1000,
          isBlocked: false,
          timeToBlockExpire: 0,
        };
      }

      // Check if the key is blocked
      const blockedKey = `${key}:blocked`;
      const isBlocked = await client.exists(blockedKey);

      if (isBlocked) {
        const blockTtl = await client.ttl(blockedKey);
        return {
          totalHits: limit + 1,
          timeToExpire: 0,
          isBlocked: true,
          timeToBlockExpire: blockTtl > 0 ? blockTtl * 1000 : 0,
        };
      }

      // Increment the counter
      const count = await client.incr(key);

      // Set expiration on first increment
      if (count === 1) {
        await client.expire(key, ttl);
      }

      // Get TTL for the key
      const remainingTtl = await client.ttl(key);
      const timeToExpire = remainingTtl > 0 ? remainingTtl * 1000 : ttl * 1000;

      // Check if limit is exceeded and block if necessary
      if (count > limit && blockDuration > 0) {
        await client.set(blockedKey, '1');
        await client.expire(blockedKey, blockDuration);

        return {
          totalHits: count,
          timeToExpire,
          isBlocked: true,
          timeToBlockExpire: blockDuration * 1000,
        };
      }

      return {
        totalHits: count,
        timeToExpire,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';

      this.logger.error(
        `Error incrementing throttle record: ${errorMessage}`,
        errorStack,
      );

      return {
        totalHits: 1,
        timeToExpire: ttl * 1000,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    }
  }
}
