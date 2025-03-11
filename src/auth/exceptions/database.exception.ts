import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception for database errors
 * Used when a database operation fails
 */
export class DatabaseException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
        error: 'Database Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
