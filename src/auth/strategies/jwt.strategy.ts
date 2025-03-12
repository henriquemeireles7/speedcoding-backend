import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types/jwt-payload';
import { UserRepository } from '../repositories/user.repository';

/**
 * JWT Strategy for authentication
 * Handles JWT token validation and extraction from Authorization header
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    // Validate JWT_SECRET is defined
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validate JWT payload and return user data
   * This method is called by Passport after JWT token is verified
   * @param payload JWT payload
   * @returns User data for request.user
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    try {
      // Validate payload has required fields
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Check if user exists in database
      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Return the payload to attach to the request object
      return {
        sub: payload.sub,
        username: payload.username,
        email: payload.email,
      };
    } catch (error) {
      // Better error handling
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
