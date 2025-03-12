import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';
import { JwtPayload } from '../types/jwt-payload';

/**
 * Test controller for demonstrating JWT authentication
 * This controller is for demonstration and testing purposes only
 */
@Controller('auth-test')
@UseGuards(JwtAuthGuard) // Apply JwtAuthGuard to all routes by default
export class AuthTestController {
  /**
   * Protected route that requires authentication
   * @param req Express request object
   * @returns User information from JWT payload
   */
  @Get('protected')
  getProtected(@Request() req: { user: JwtPayload }) {
    return {
      message: 'This is a protected route',
      user: req.user,
    };
  }

  /**
   * Public route that doesn't require authentication
   * @returns Public message
   */
  @Public()
  @Get('public')
  getPublic() {
    return {
      message: 'This is a public route',
    };
  }

  /**
   * Route that returns the current user from the JWT token
   * @param req Express request object
   * @returns User information from JWT payload
   */
  @Get('me')
  getProfile(@Request() req: { user: JwtPayload }) {
    return {
      user: req.user,
    };
  }
}
