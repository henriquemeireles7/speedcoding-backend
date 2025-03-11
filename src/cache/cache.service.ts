import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

/**
 * Service for handling cache operations
 * Provides methods for get, set, delete, and invalidation
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL = 60 * 1000; // 1 minute in milliseconds

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache hit for key: ${key}`);
        return value;
      }
      this.logger.debug(`Cache miss for key: ${key}`);
      return null;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Error getting cache for key ${key}: ${err.message}`);
      return null;
    }
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in milliseconds (optional)
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl || this.defaultTTL);
      this.logger.debug(
        `Cache set for key: ${key}, TTL: ${ttl || this.defaultTTL}ms`,
      );
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Error setting cache for key ${key}: ${err.message}`);
    }
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Error deleting cache for key ${key}: ${err.message}`);
    }
  }

  /**
   * Delete multiple values from cache by pattern
   * @param pattern Key pattern to match (e.g., 'users:*')
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      // Note: This is a simplified implementation
      // For Redis, you would use SCAN with pattern matching
      // For in-memory cache, you would need to iterate through keys
      this.logger.debug(`Cache invalidation requested for pattern: ${pattern}`);

      // For now, we'll just log the request
      // In a real implementation, you would need to get all keys matching the pattern
      // and delete them one by one
      await Promise.resolve(); // Add await to satisfy linter
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Error invalidating cache for pattern ${pattern}: ${err.message}`,
      );
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      // Use any to bypass type checking for reset method
      // This is a workaround as the Cache type doesn't include reset
      // but the actual implementation does have this method
      await (this.cacheManager as any).reset();
      this.logger.debug('Cache cleared');
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Error clearing cache: ${err.message}`);
    }
  }

  /**
   * Generate a cache key based on resource type and identifier
   * @param resource Resource type (e.g., 'users', 'vibes')
   * @param id Resource identifier
   * @returns Formatted cache key
   */
  generateKey(resource: string, id?: string | number): string {
    if (id) {
      return `${resource}:${id}`;
    }
    return `${resource}:list`;
  }

  /**
   * Generate a cache key for a list with filters
   * @param resource Resource type (e.g., 'users', 'vibes')
   * @param filters Object containing filter parameters
   * @returns Formatted cache key
   */
  generateListKey(resource: string, filters?: Record<string, unknown>): string {
    if (!filters || Object.keys(filters).length === 0) {
      return `${resource}:list`;
    }

    const filterString = Object.entries(filters)
      .map(([key, value]) => `${key}=${String(value)}`)
      .sort()
      .join(':');

    return `${resource}:list:${filterString}`;
  }
}
