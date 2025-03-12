import { Injectable, ExecutionContext } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerException,
  ThrottlerLimitDetail,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { ThrottlerStorage } from '@nestjs/throttler';

// Define a more specific route type
interface RouteInfo {
  path?: string;
  [key: string]: any;
}

// Define a more specific user type
interface RequestUser {
  id: string | number;
  [key: string]: any;
}

// Add type definitions to Express Request
type CustomRequest = Request & {
  route?: RouteInfo;
  user?: RequestUser;
};

/**
 * Custom throttler guard with different limits for different endpoints
 * Extends ThrottlerGuard with additional functionality
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private readonly configService: ConfigService;

  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    configService: ConfigService,
  ) {
    super(options, storageService, reflector);
    this.configService = configService;
  }

  /**
   * Get request record key based on IP and user ID
   * @param context Execution context
   * @returns Promise with record key
   */
  protected override async getTracker(
    context: ExecutionContext,
  ): Promise<string> {
    // Ensure this is actually async even though it doesn't need to be
    await Promise.resolve();

    const request = context.switchToHttp().getRequest<CustomRequest>();
    const ip = request.ip || 'unknown';
    const userId = request.user?.id || 'anonymous';

    // For authenticated routes, use both IP and user ID
    if (userId !== 'anonymous') {
      return `${ip}-${String(userId)}`;
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
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const method = request.method;
    // Type assertion for route since we know its structure
    const route = request.route as RouteInfo | undefined;

    // Default values
    const defaultTtl = 60; // 1 minute
    const defaultLimit = 60; // 60 requests per minute

    // Custom limits for specific routes
    if (route?.path) {
      const routePath = String(route.path);

      // Authentication endpoints
      if (routePath.includes('/auth/login')) {
        return { ttl: 15 * 60, limit: 5 }; // 5 attempts per 15 minutes
      }

      if (routePath.includes('/auth/register')) {
        return { ttl: 60 * 60, limit: 3 }; // 3 attempts per hour
      }

      // Run endpoints
      if (routePath.includes('/runs/start')) {
        return { ttl: 60 * 60, limit: 10 }; // 10 starts per hour
      }

      // Submission endpoints
      if (routePath.includes('/submissions') && method === 'POST') {
        return { ttl: 60 * 60, limit: 5 }; // 5 submissions per hour
      }

      // Admin endpoints
      if (routePath.includes('/admin')) {
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
   * @param throttlerLimitDetail Throttler limit detail
   * @throws ThrottlerException
   */
  protected override async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    // Ensure this is actually async even though it doesn't need to be
    await Promise.resolve();

    const request = context.switchToHttp().getRequest<CustomRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    // Extract timeToExpire in ms and convert to seconds
    const ttlSeconds = Math.ceil(throttlerLimitDetail.timeToExpire / 1000);

    // Add rate limit headers
    response.header('Retry-After', String(ttlSeconds));
    response.header(
      'X-RateLimit-Reset',
      String(Date.now() + throttlerLimitDetail.timeToExpire),
    );

    // Log rate limit violation
    console.warn(
      `Rate limit exceeded for ${request.ip} on ${request.method} ${request.url}`,
    );

    throw new ThrottlerException();
  }
}
