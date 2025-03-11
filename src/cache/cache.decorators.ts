import { SetMetadata } from '@nestjs/common';

/**
 * Cache key for storing TTL in metadata
 */
export const CACHE_TTL_KEY = 'cache:ttl';

/**
 * Cache key for storing if method should be cached
 */
export const CACHE_ENABLED_KEY = 'cache:enabled';

/**
 * Cache key for storing if method should evict cache
 */
export const CACHE_EVICT_KEY = 'cache:evict';

/**
 * Cache key for storing patterns to evict
 */
export const CACHE_EVICT_PATTERNS_KEY = 'cache:evict:patterns';

/**
 * Decorator for enabling caching on a method
 * @param ttl Time to live in milliseconds
 */
export const Cacheable = (ttl?: number) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_ENABLED_KEY, true)(target, key, descriptor);
    if (ttl) {
      SetMetadata(CACHE_TTL_KEY, ttl)(target, key, descriptor);
    }
    return descriptor;
  };
};

/**
 * Decorator for evicting cache on a method
 * @param patterns Patterns to evict (e.g., 'users:*')
 */
export const CacheEvict = (patterns: string | string[]) => {
  const patternArray = Array.isArray(patterns) ? patterns : [patterns];
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_EVICT_KEY, true)(target, key, descriptor);
    SetMetadata(CACHE_EVICT_PATTERNS_KEY, patternArray)(
      target,
      key,
      descriptor,
    );
    return descriptor;
  };
};
