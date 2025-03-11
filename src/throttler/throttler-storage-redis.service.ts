import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from '../redis/redis.service';

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
   * @returns Current count
   */
  async increment(key: string, ttl: number): Promise<number> {
    try {
      const client = this.redisService.getClient();
      if (!client) {
        this.logger.warn('Redis client not available, using in-memory storage');
        return 1; // Fallback to in-memory storage
      }

      const count = await client.incr(key);

      // Set expiration on first increment
      if (count === 1) {
        await client.expire(key, ttl);
      }

      return count;
    } catch (error) {
      this.logger.error(
        `Error incrementing throttle record: ${error.message}`,
        error.stack,
      );
      return 1; // Fallback to in-memory storage
    }
  }

  /**
   * Get the current count for a throttle record
   * @param key Record key
   * @returns Current count
   */
  async get(key: string): Promise<number> {
    try {
      const client = this.redisService.getClient();
      if (!client) {
        this.logger.warn('Redis client not available, using in-memory storage');
        return 0;
      }

      const value = await client.get(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      this.logger.error(
        `Error getting throttle record: ${error.message}`,
        error.stack,
      );
      return 0;
    }
  }
}
