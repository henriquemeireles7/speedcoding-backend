import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtPayload } from '../types/jwt-payload';
/**
 * JWT Authentication Guard
 * Used to protect routes that require authentication
 * Can be bypassed with the @Public() decorator
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determine if the current route is protected or public
   * @param context Execution context
   * @returns Whether to activate the guard
   */
  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Skip authentication for public routes
    if (isPublic) {
      return true;
    }

    // Perform JWT authentication
    return super.canActivate(context);
  }

  /**
   * Handle authentication errors and return the user if authenticated
   * This method is called by Passport after the strategy has been executed
   * @param err Error object or null if no error
   * @param user User from JWT payload or false if authentication failed
   * @returns The authenticated user object
   */
  handleRequest<TUser = JwtPayload>(
    err: Error | null | undefined,
    user: TUser | false | null,
  ): TUser {
    // If error or no user, throw unauthorized exception
    if (err || !user) {
      throw new UnauthorizedException(
        err instanceof Error
          ? err.message
          : 'You are not authorized to access this resource',
      );
    }

    // Return the user
    return user;
  }
}
