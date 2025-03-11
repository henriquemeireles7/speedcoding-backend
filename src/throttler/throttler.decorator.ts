import { SetMetadata } from '@nestjs/common';

/**
 * Throttle key for storing custom limits in metadata
 */
export const THROTTLE_LIMIT_KEY = 'throttle:limit';

/**
 * Decorator for setting custom rate limits on a method
 * @param limit Number of requests allowed in the time window
 * @param ttl Time window in seconds
 */
export const Throttle = (limit: number, ttl: number) => {
  return SetMetadata(THROTTLE_LIMIT_KEY, { limit, ttl });
};
