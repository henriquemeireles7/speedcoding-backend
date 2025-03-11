import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { SocialUserDto } from '../dto/social-user.dto';
import { TokensDto } from '../dto/tokens.dto';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from './token.service';
import { CredentialsService } from './credentials.service';
import { SocialAuthException } from '../exceptions/social-auth.exception';

/**
 * Service responsible for handling social authentication
 * Manages login with Google, GitHub, and other OAuth providers
 */
@Injectable()
export class SocialAuthService {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService,
    private credentialsService: CredentialsService,
  ) {}

  /**
   * Handle social login (Google, GitHub, etc.)
   * @param socialUser User data from OAuth provider
   * @returns Access and refresh tokens
   */
  async socialLogin(socialUser: SocialUserDto): Promise<TokensDto> {
    const {
      email,
      provider,
      providerId,
      firstName,
      lastName,
      picture,
      username,
    } = socialUser;

    try {
      // Check if user exists by provider and providerId
      let user = await this.userRepository.findBySocialConnection(
        provider,
        providerId,
      );

      // If user doesn't exist, check by email
      if (!user) {
        user = await this.userRepository.findByEmail(email);
      }

      // Generate a display name from first and last name
      const displayName = [firstName, lastName].filter(Boolean).join(' ');

      // Generate a username if not provided
      const generatedUsername =
        username || this.generateUsername(email, firstName, lastName);

      if (user) {
        // User exists, update social connection if needed
        const existingConnection =
          await this.userRepository.findSocialConnection(
            user.id,
            provider,
            providerId,
          );

        if (!existingConnection) {
          // Add new social connection
          await this.userRepository.createSocialConnection(
            user.id,
            provider,
            providerId,
          );
        }

        // Update user profile with social data if needed
        if (!user.avatarUrl && picture) {
          await this.userRepository.updateUserProfile(user.id, {
            avatarUrl: picture,
            displayName: user.displayName || displayName,
          });
        }
      } else {
        // Create new user with social data
        // Generate a random password for the user
        const randomPassword = uuidv4();
        const passwordHash =
          await this.credentialsService.hashPassword(randomPassword);

        // Create user and social connection
        user = await this.userRepository.createUserWithSocialConnection(
          {
            email,
            username: generatedUsername,
            passwordHash,
            isEmailVerified: true, // Social login users are considered verified
            displayName: displayName || generatedUsername,
            avatarUrl: picture,
          },
          {
            provider,
            providerId,
          },
        );
      }

      // Ensure user is defined before generating tokens
      if (!user) {
        throw new SocialAuthException('Failed to retrieve or create user');
      }

      // Generate tokens
      const tokens = this.tokenService.generateTokens(
        user.id,
        user.username,
        user.email,
      );

      // Store refresh token
      await this.tokenService.storeRefreshToken(tokens.refreshToken, user.id);

      return tokens;
    } catch (error) {
      throw new SocialAuthException(
        `Failed to process social login: ${error.message}`,
      );
    }
  }

  /**
   * Generate a username from email or name
   * @param email User email
   * @param firstName First name (optional)
   * @param lastName Last name (optional)
   * @returns Generated username
   */
  private generateUsername(
    email: string,
    firstName?: string,
    lastName?: string,
  ): string {
    // Try to generate from name
    if (firstName) {
      const firstPart = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const secondPart = lastName
        ? lastName.toLowerCase().replace(/[^a-z0-9]/g, '')
        : '';

      if (firstPart && secondPart) {
        return `${firstPart}${secondPart.charAt(0)}`;
      }

      if (firstPart) {
        return firstPart;
      }
    }

    // Fall back to email
    const emailUsername = email.split('@')[0];
    return emailUsername.replace(/[^a-z0-9]/g, '');
  }
}
