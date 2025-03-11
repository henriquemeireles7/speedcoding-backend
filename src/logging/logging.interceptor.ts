import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { LoggingService } from './logging.service';
import { Request, Response } from 'express';

// Define interface for request with requestId
interface RequestWithId extends Request {
  requestId: string;
}

/**
 * Interceptor for logging HTTP requests and responses
 * Adds request ID for tracing and logs request/response details
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Safely extract properties
    const method = request.method || 'UNKNOWN';
    const url = request.url || 'UNKNOWN';
    const body = request.body as Record<string, unknown>;
    const params = request.params as Record<string, string>;
    const query = request.query as Record<string, string>;

    // Generate request ID for tracing
    const requestId = uuidv4();
    (request as RequestWithId).requestId = requestId;
    response.setHeader('X-Request-ID', requestId);

    // Log request details
    const requestMessage = `Request ${method} ${url}`;
    const requestMetadata: Record<string, unknown> = {
      requestId,
      method,
      url,
      body: this.sanitizeData(body),
      params,
      query,
      ip: request.ip,
      userAgent: request.get('user-agent'),
    };

    this.loggingService.logWithMetadata(
      'debug',
      requestMessage,
      requestMetadata,
    );

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Log response details
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;

          const responseMessage = `Response ${method} ${url} ${statusCode} ${responseTime}ms`;
          const responseMetadata: Record<string, unknown> = {
            requestId,
            statusCode,
            responseTime,
            dataSize: this.getDataSize(data),
          };

          // Log at different levels based on status code
          const logLevel = this.getLogLevelForStatus(statusCode);
          this.loggingService.logWithMetadata(
            logLevel,
            responseMessage,
            responseMetadata,
          );
        },
        error: (error: Error & { status?: number }) => {
          // Log error details
          const responseTime = Date.now() - startTime;
          const statusCode = error.status || 500;

          const errorMessage = `Error ${method} ${url} ${statusCode} ${responseTime}ms`;
          const errorMetadata: Record<string, unknown> = {
            requestId,
            statusCode,
            responseTime,
            error: error.message,
            stack: error.stack,
          };

          this.loggingService.logWithMetadata(
            'error',
            errorMessage,
            errorMetadata,
          );
        },
      }),
    );
  }

  /**
   * Sanitize sensitive data from request body
   * @param data Data to sanitize
   * @returns Sanitized data
   */
  private sanitizeData(
    data: Record<string, any> | null | undefined,
  ): Record<string, any> | null | undefined {
    if (!data) return data;

    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Get the size of data in bytes
   * @param data Data to measure
   * @returns Size in bytes
   */
  private getDataSize(data: any): number {
    if (!data) return 0;

    try {
      const jsonString = JSON.stringify(data);
      return jsonString.length;
    } catch {
      // Ignore error and return 0
      return 0;
    }
  }

  /**
   * Get the appropriate log level based on status code
   * @param statusCode HTTP status code
   * @returns Log level
   */
  private getLogLevelForStatus(
    statusCode: number,
  ): 'error' | 'warn' | 'log' | 'debug' {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    if (statusCode >= 300) return 'log';
    return 'debug';
  }
}
