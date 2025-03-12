import { SetMetadata } from '@nestjs/common';

/**
 * Key for identifying public routes
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public decorator
 * Used to mark routes as public, exempting them from JWT authentication
 *
 * Example usage:
 * ```
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
