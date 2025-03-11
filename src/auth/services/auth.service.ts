import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { TokensDto } from '../dto/tokens.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerificationDto } from '../dto/resend-verification.dto';
import { RequestPasswordResetDto } from '../dto/request-password-reset.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SocialUserDto } from '../dto/social-user.dto';
import { SocialAuthService } from './social-auth.service';
import { LoginService } from './login.service';
import { RegisterService } from './register.service';
import { UserRepository } from '../repositories/user.repository';
import { UserNotFoundException } from '../exceptions';

/**
 * Main authentication service
 * Acts as a facade for specialized services
 */
@Injectable()
export class AuthService {
  constructor(
    private loginService: LoginService,
    private registerService: RegisterService,
    private socialAuthService: SocialAuthService,
    private userRepository: UserRepository,
  ) {}

  /**
   * Register a new user
   * @param registerDto Registration data
   * @returns Access and refresh tokens
   */
  async register(registerDto: RegisterDto): Promise<TokensDto> {
    return this.registerService.register(registerDto);
  }

  /**
   * Verify a user's email
   * @param verifyEmailDto Verification data
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    await this.registerService.verifyEmail(verifyEmailDto);
  }

  /**
   * Resend verification email
   * @param resendVerificationDto Resend verification data
   */
  async resendVerificationEmail(
    resendVerificationDto: ResendVerificationDto,
  ): Promise<void> {
    await this.registerService.resendVerificationEmail(resendVerificationDto);
  }

  /**
   * Request password reset
   * @param requestPasswordResetDto Password reset request data
   */
  async requestPasswordReset(
    requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<void> {
    await this.registerService.requestPasswordReset(requestPasswordResetDto);
  }

  /**
   * Reset password
   * @param resetPasswordDto Password reset data
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    await this.registerService.resetPassword(resetPasswordDto);
  }

  /**
   * Login a user
   * @param loginDto Login data
   * @returns Access and refresh tokens
   */
  async login(loginDto: LoginDto): Promise<TokensDto> {
    return this.loginService.login(loginDto);
  }

  /**
   * Refresh tokens
   * @param refreshTokenDto Refresh token data
   * @returns New access and refresh tokens
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<TokensDto> {
    return this.loginService.refreshTokens(refreshTokenDto);
  }

  /**
   * Logout a user
   * @param refreshToken Refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await this.loginService.logout(refreshToken);
  }

  /**
   * Get user profile
   * @param userId User ID
   * @returns User profile
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException('User not found');
    }

    // Return user profile without sensitive information
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      location: user.location,
      website: user.website,
      socialLinks: user.socialLinks,
      skills: user.skills,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Handle social login
   * @param socialUser Social user data
   * @returns Access and refresh tokens
   */
  async socialLogin(socialUser: SocialUserDto): Promise<TokensDto> {
    return this.socialAuthService.socialLogin(socialUser);
  }
}
