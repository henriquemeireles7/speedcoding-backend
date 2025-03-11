import { Injectable } from '@nestjs/common';
import {
  RegisterDto,
  LoginDto,
  TokensDto,
  RefreshTokenDto,
  VerifyEmailDto,
  ResendVerificationDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  SocialUserDto,
} from '../dto';
import { AuthUserDto } from '../dto/auth-user.dto';
import { SocialAuthService, LoginService, RegisterService } from './';
import { UserRepository } from '../repositories/user.repository';
import { UserNotFoundException } from '../exceptions';
import { AuthUser } from '../entities/auth-user.entity';

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
   * @returns User profile DTO
   */
  async getProfile(userId: string): Promise<AuthUserDto> {
    const userData = await this.userRepository.findById(userId);
    if (!userData) {
      throw new UserNotFoundException('User not found');
    }

    // Create domain entity from database data
    const authUser = AuthUser.fromDatabaseUser(userData);

    // Return DTO for API response
    return AuthUserDto.fromEntity(authUser);
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
