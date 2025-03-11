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

/**
 * Interceptor for automatic caching of GET endpoints
 * Caches responses and returns cached data when available
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);
  private readonly defaultTTL = 60 * 1000; // 1 minute in milliseconds

  constructor(private cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

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
      tap(async (data) => {
        // Get TTL from metadata or use default
        const ttl = this.getTTL(context) || this.defaultTTL;

        // Cache the response
        await this.cacheService.set(cacheKey, data, ttl);
      }),
    );
  }

  /**
   * Get TTL from metadata if available
   * @param context Execution context
   * @returns TTL in milliseconds or undefined
   */
  private getTTL(context: ExecutionContext): number | undefined {
    // This would be implemented to get TTL from @Cacheable decorator
    // For now, return undefined to use default TTL
    return undefined;
  }
}
