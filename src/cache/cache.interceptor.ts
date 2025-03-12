import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { CACHE_TTL_KEY } from './cache.decorators';

/**
 * Interceptor for automatic caching of GET endpoints
 * Caches responses and returns cached data when available
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);
  private readonly defaultTTL = 60 * 1000; // 1 minute in milliseconds

  constructor(
    private cacheService: CacheService,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Skip cache if requested
    if (request.query.skipCache === 'true') {
      this.logger.debug(`Skipping cache for: ${request.url}`);
      return next.handle();
    }

    // Generate cache key from request URL
    const cacheKey = `http:${request.url}`;

    try {
      // Try to get from cache
      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        this.logger.debug(`Cache hit for: ${request.url}`);
        response.setHeader('X-Cache', 'HIT');
        return of(cachedData);
      }

      // Cache miss, execute handler and cache result
      this.logger.debug(`Cache miss for: ${request.url}`);
      response.setHeader('X-Cache', 'MISS');

      return next.handle().pipe(
        tap((data: unknown) => {
          if (data) {
            // Get TTL from metadata or use default
            const ttl = this.getTTL(context) || this.defaultTTL;

            // Cache the response - handle this asynchronously without awaiting
            this.cacheService.set(cacheKey, data, ttl).catch((error) => {
              this.logger.error(
                `Failed to cache response: ${error instanceof Error ? error.message : 'Unknown error'}`,
              );
            });
          }
        }),
      );
    } catch (error) {
      // If caching fails, just continue without caching
      this.logger.error(
        `Cache error for ${request.url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return next.handle();
    }
  }

  /**
   * Get TTL from metadata if available
   * @param context Execution context
   * @returns TTL in milliseconds or undefined
   */
  private getTTL(context: ExecutionContext): number | undefined {
    const handler = context.getHandler();
    return this.reflector.get<number>(CACHE_TTL_KEY, handler);
  }
}
