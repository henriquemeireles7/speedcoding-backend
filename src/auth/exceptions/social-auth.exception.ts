import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception for social authentication errors
 * Used when social authentication fails
 */
export class SocialAuthException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
        error: 'Social Authentication Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
