import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { ErrorResponse } from '../types/error-response';
import { FormattedResponse } from '../types/formatted-response';

/**
 * Global exception filter
 * Catches all exceptions and provides consistent error responses
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine the status code and error message
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    // Log the error
    this.logger.error(
      `Exception: ${status} - ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Format the error response
    const formattedResponse: FormattedResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: this.getErrorMessage(message),
    };

    response.status(status).json(formattedResponse);
  }

  /**
   * Extract error message from the exception response
   * @param errorResponse Exception response
   * @returns Formatted error message
   */
  private getErrorMessage(errorResponse: unknown): unknown {
    // If the error response is a string, return it directly
    if (typeof errorResponse === 'string') {
      return {
        message: errorResponse,
      };
    }

    // If the error response is an object with a message property, return it
    if (
      typeof errorResponse === 'object' &&
      errorResponse !== null &&
      'message' in errorResponse
    ) {
      const typedError = errorResponse as ErrorResponse;
      return {
        message: typedError.message,
        details: typedError.error || undefined,
      };
    }

    // Otherwise, return the entire error response
    return errorResponse;
  }
}
