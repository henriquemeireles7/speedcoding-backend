import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception for user not found errors
 * Used when a user cannot be found by ID, email, username, etc.
 */
export class UserNotFoundException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message,
        error: 'User Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
