export { MetricsModule } from './metrics.module';
export { MetricsService } from './metrics.service';
export { MetricsController } from './metrics.controller';

// Create and export the metrics interceptor
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

/**
 * Interceptor that records HTTP request metrics
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path } = request;
    const startTime = Date.now();
    const requestSize = request.headers['content-length']
      ? parseInt(request.headers['content-length'], 10)
      : 0;

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const responseSize = JSON.stringify(data).length;
          const duration = Date.now() - startTime;

          this.metricsService.recordHttpRequest(
            method,
            path,
            statusCode,
            duration / 1000, // Convert to seconds
            requestSize,
            responseSize,
          );
        },
        error: (error) => {
          const statusCode = error.status || 500;
          const duration = Date.now() - startTime;

          this.metricsService.recordHttpRequest(
            method,
            path,
            statusCode,
            duration / 1000, // Convert to seconds
            requestSize,
            0, // No response size for errors
          );
        },
      }),
    );
  }
}
