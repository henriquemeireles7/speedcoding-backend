import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';

/**
 * Guard to check if user's email is verified
 * Used to protect routes that require verified email
 */
@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private userRepository: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user is authenticated, this should be handled by the JWT guard
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Get the user from the database to check email verification status
    const dbUser = await this.userRepository.findById(user.sub);

    if (!dbUser) {
      throw new UnauthorizedException('User not found');
    }

    if (!dbUser.isEmailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    return true;
  }
}
