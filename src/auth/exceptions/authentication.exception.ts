import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception for authentication errors
 * Used when authentication fails due to invalid credentials, expired tokens, etc.
 */
export class AuthenticationException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        error: 'Authentication Error',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
