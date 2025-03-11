import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

/**
 * Custom throttler guard with different limits for different endpoints
 * Extends ThrottlerGuard with additional functionality
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(private configService: ConfigService) {
    super();
  }

  /**
   * Get request record key based on IP and user ID
   * @param context Execution context
   * @returns Record key
   */
  protected getTracker(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const userId = request.user?.id || 'anonymous';

    // For authenticated routes, use both IP and user ID
    if (userId !== 'anonymous') {
      return `${ip}-${userId}`;
    }

    // For public routes, use IP only
    return ip;
  }

  /**
   * Get TTL and limit based on route
   * @param context Execution context
   * @returns TTL and limit
   */
  protected getRouteTtlAndLimit(context: ExecutionContext): {
    ttl: number;
    limit: number;
  } {
    const request = context.switchToHttp().getRequest();
    const { method, route } = request;

    // Default values
    const defaultTtl = 60; // 1 minute
    const defaultLimit = 60; // 60 requests per minute

    // Custom limits for specific routes
    if (route?.path) {
      // Authentication endpoints
      if (route.path.includes('/auth/login')) {
        return { ttl: 15 * 60, limit: 5 }; // 5 attempts per 15 minutes
      }

      if (route.path.includes('/auth/register')) {
        return { ttl: 60 * 60, limit: 3 }; // 3 attempts per hour
      }

      // Run endpoints
      if (route.path.includes('/runs/start')) {
        return { ttl: 60 * 60, limit: 10 }; // 10 starts per hour
      }

      // Submission endpoints
      if (route.path.includes('/submissions') && method === 'POST') {
        return { ttl: 60 * 60, limit: 5 }; // 5 submissions per hour
      }

      // Admin endpoints
      if (route.path.includes('/admin')) {
        return { ttl: 60, limit: 300 }; // 300 requests per minute
      }
    }

    // User-specific endpoints (authenticated)
    if (request.user) {
      return { ttl: defaultTtl, limit: 120 }; // 120 requests per minute
    }

    // Public endpoints
    return { ttl: defaultTtl, limit: defaultLimit };
  }

  /**
   * Handle throttling exception
   * @param context Execution context
   * @param ttl Time to live
   * @param limit Rate limit
   */
  protected throwThrottlingException(
    context: ExecutionContext,
    ttl: number,
    limit: number,
  ): void {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Add rate limit headers
    response.header('Retry-After', Math.ceil(ttl));
    response.header('X-RateLimit-Limit', limit);
    response.header('X-RateLimit-Remaining', 0);
    response.header('X-RateLimit-Reset', Date.now() + ttl * 1000);

    // Log rate limit violation
    console.warn(
      `Rate limit exceeded for ${request.ip} on ${request.method} ${request.url}`,
    );

    throw new ThrottlerException();
  }
}
