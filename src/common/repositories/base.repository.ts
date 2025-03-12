import { DatabaseException } from '../../auth/exceptions/database.exception';

/**
 * Base repository class with common error handling functionality
 * Provides a consistent way to handle database operation errors across repositories
 */
export abstract class BaseRepository {
  /**
   * Execute a Prisma operation and handle any errors consistently
   * @param operation Function that performs the Prisma operation
   * @param action Description of the action being performed (for error messages)
   * @returns Result of the operation
   * @throws DatabaseException with formatted error message
   */
  protected async handlePrismaError<T>(
    operation: () => Promise<T>,
    action: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new DatabaseException(`Error ${action}: ${errorMessage}`);
    }
  }
}
