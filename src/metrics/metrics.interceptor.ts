import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';
import { Request, Response } from 'express';

/**
 * Interceptor that automatically records HTTP metrics for all requests
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const startTime = Date.now();
    const requestSize = request.headers['content-length']
      ? parseInt(request.headers['content-length'], 10)
      : 0;

    // Skip metrics endpoint to avoid circular metrics
    if (url.startsWith('/metrics')) {
      return next.handle();
    }

    // Extract path without query parameters
    const path = url.split('?')[0];

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse<Response>();
          const statusCode = response.statusCode;
          const responseSize = JSON.stringify(data).length;
          const duration = (Date.now() - startTime) / 1000; // Convert to seconds

          this.metricsService.recordHttpRequest(
            method,
            path,
            statusCode,
            duration,
            requestSize,
            responseSize,
          );
        },
        error: (error: any) => {
          // Use type assertion to safely access the status property
          const statusCode = (error as { status?: number }).status || 500;
          const duration = (Date.now() - startTime) / 1000; // Convert to seconds

          this.metricsService.recordHttpRequest(
            method,
            path,
            statusCode,
            duration,
            requestSize,
          );
        },
      }),
    );
  }
}
