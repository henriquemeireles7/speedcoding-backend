import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '../types/error-response';
import { FormattedResponse } from '../types/formatted-response';

/**
 * Global HTTP exception filter
 * Provides consistent error responses across the application
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    // Log the error
    this.logger.error(
      `HTTP Exception: ${status} - ${request.method} ${request.url}`,
      exception.stack,
    );

    // Format the error response
    const formattedResponse: FormattedResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: this.getErrorMessage(errorResponse),
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
