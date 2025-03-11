import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';
import { SentryService } from './sentry.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

// Define a more specific user type
interface RequestUser {
  id: string | number;
  email?: string | null;
  username?: string | null;
  [key: string]: any;
}

// Extend Express Request to include our user type
declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

/**
 * Interceptor that captures request context and errors for Sentry
 * Adds breadcrumbs, user context, and transaction data
 */
@Injectable()
export class SentryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SentryInterceptor.name);

  constructor(
    private readonly sentryService: SentryService,
    private readonly configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Skip if Sentry is not enabled
    if (!this.configService.get<string>('SENTRY_DSN')) {
      return next.handle();
    }

    // Only handle HTTP requests
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, headers, ip, body, params, query, user } = request;

    // Start a transaction for performance monitoring
    const transaction = this.sentryService.startTransaction({
      name: `${method} ${this.getRouteFromUrl(url)}`,
      op: 'http.server',
      tags: {
        method,
        route: this.getRouteFromUrl(url),
      },
    });

    // Add request data as breadcrumb
    this.sentryService.addBreadcrumb({
      category: 'http',
      message: `${method} ${url}`,
      level: 'info',
      data: {
        method,
        url,
        // Include safe headers only
        headers: this.sanitizeHeaders(headers),
        params,
        query,
      },
    });

    // Set user context if available
    if (user) {
      this.sentryService.setUser({
        id: String(user.id),
        email: user.email ? String(user.email) : undefined,
        username: user.username ? String(user.username) : undefined,
      });
    } else {
      // Use IP as anonymous user ID
      this.sentryService.setUser({
        id: ip || 'anonymous',
      });
    }

    // Set request context
    const requestId = headers['x-request-id'];
    this.sentryService.setTag(
      'request_id',
      requestId
        ? Array.isArray(requestId)
          ? requestId[0]
          : requestId
        : 'unknown',
    );
    this.sentryService.setTag('http.method', method);
    this.sentryService.setTag('http.url', url);

    return next.handle().pipe(
      tap(() => {
        // Request completed successfully
        const response = context.switchToHttp().getResponse<Response>();
        if (transaction) {
          transaction.setHttpStatus(response.statusCode);
          transaction.finish();
        }
      }),
      catchError((error) => {
        // Extract status code and message
        let status = 500;
        let message = error.message || 'Internal Server Error';

        if (error instanceof HttpException) {
          status = error.getStatus();
          message = error.message;
        }

        // Set error context
        if (transaction) {
          transaction.setHttpStatus(status);
        }
        this.sentryService.setTag('error', 'true');
        this.sentryService.setTag('error.type', error.name);
        this.sentryService.setTag('error.message', message);
        this.sentryService.setTag('error.status_code', status.toString());

        // Only capture exceptions for 5xx errors or non-HTTP exceptions
        if (status >= 500 || !(error instanceof HttpException)) {
          // Add request body for server errors, but sanitize sensitive data
          const sanitizedBody = this.sanitizeRequestBody(body);

          this.sentryService.captureException(error, {
            extra: {
              request: {
                method,
                url,
                headers: this.sanitizeHeaders(headers),
                params,
                query,
                body: sanitizedBody,
              },
            },
          });
        }

        // Finish the transaction
        if (transaction) {
          transaction.finish();
        }

        // Re-throw the error to be handled by exception filters
        throw error;
      }),
    );
  }

  /**
   * Extract the route pattern from a URL
   * Converts dynamic segments to parameter placeholders
   */
  private getRouteFromUrl(url: string): string {
    // Remove query string
    const path = url.split('?')[0];

    // Replace numeric IDs with :id
    return path
      .replace(
        /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
        '/:id',
      )
      .replace(/\/\d+/g, '/:id');
  }

  /**
   * Sanitize headers to remove sensitive information
   */
  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized = { ...headers };

    // Remove sensitive headers
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'set-cookie',
      'x-auth-token',
      'x-api-key',
    ];

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        // Handle both string and string[] headers
        if (Array.isArray(sanitized[header])) {
          sanitized[header] = ['[REDACTED]'];
        } else {
          sanitized[header] = '[REDACTED]';
        }
      }
    });

    return sanitized;
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = [
      'password',
      'passwordConfirmation',
      'currentPassword',
      'newPassword',
      'token',
      'refreshToken',
      'accessToken',
      'credit_card',
      'creditCard',
      'cardNumber',
      'cvv',
      'ssn',
    ];

    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
