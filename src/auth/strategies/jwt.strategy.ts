import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * JWT payload interface
 */
interface JwtPayload {
  sub: number; // User ID
  username: string;
}

/**
 * JWT Strategy for authentication
 * Validates JWT tokens and extracts user information
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecret', // Use environment variable or default
    });
  }

  /**
   * Validate the JWT payload and return the user
   * @param payload JWT payload containing user information
   * @returns User object if valid
   */
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true }, // Don't include password hash
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
