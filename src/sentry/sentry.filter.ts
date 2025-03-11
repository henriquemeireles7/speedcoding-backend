import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SentryService } from './sentry.service';
import { ConfigService } from '@nestjs/config';

/**
 * Exception filter that captures all unhandled exceptions and sends them to Sentry
 * Works as a fallback for exceptions not caught by the interceptor
 */
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  constructor(
    private readonly sentryService: SentryService,
    private readonly configService: ConfigService,
  ) {}

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Determine if this is an HTTP exception
    const isHttpException = exception instanceof HttpException;

    // Get status code
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Get error message
    const message = isHttpException
      ? exception.message
      : exception.message || 'Internal Server Error';

    // Only report 5xx errors or non-HTTP exceptions to Sentry
    if (status >= 500 || !isHttpException) {
      // Skip if Sentry is not enabled
      if (this.configService.get<string>('SENTRY_DSN')) {
        // Capture exception with request context
        this.sentryService.captureException(exception, (scope) => {
          // Add request data
          scope.setExtra('request', {
            method: request.method,
            url: request.url,
            headers: this.sanitizeHeaders(request.headers),
            params: request.params,
            query: request.query,
            body: this.sanitizeRequestBody(request.body),
          });

          // Add user data if available
          if (request.user) {
            scope.setUser({
              id: request.user['id'],
              email: request.user['email'],
              username: request.user['username'],
            });
          } else {
            scope.setUser({
              id: request.ip || 'anonymous',
            });
          }

          // Add tags
          scope.setTag('error', 'true');
          scope.setTag('error.type', exception.name || 'Error');
          scope.setTag('error.message', message);
          scope.setTag('error.status_code', status.toString());
          scope.setTag(
            'request_id',
            request.headers['x-request-id'] || 'unknown',
          );

          return scope;
        });
      }
    }

    // Log the error
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status}: ${message}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${status}: ${message}`,
      );
    }

    // Let the default exception handler finish processing the request
    if (isHttpException) {
      response.status(status).json(exception.getResponse());
    } else {
      response.status(status).json({
        statusCode: status,
        message: 'Internal Server Error',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
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
