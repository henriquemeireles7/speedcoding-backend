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
import { TokenService } from './token.service';
import { CredentialsService } from './credentials.service';
import { SocialAuthService } from './social-auth.service';
import { UserRepository } from '../repositories/user.repository';
import {
  AuthenticationException,
  UserNotFoundException,
  DatabaseException,
} from '../exceptions';

/**
 * Main authentication service
 * Acts as a facade for specialized services
 */
@Injectable()
export class AuthService {
  constructor(
    private tokenService: TokenService,
    private credentialsService: CredentialsService,
    private socialAuthService: SocialAuthService,
    private userRepository: UserRepository,
  ) {}

  /**
   * Register a new user
   * @param registerDto Registration data
   * @returns Access and refresh tokens
   */
  async register(registerDto: RegisterDto): Promise<TokensDto> {
    const { email, username, password } = registerDto;

    // Check if email or username already exists
    const existingUserByEmail = await this.userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new AuthenticationException('Email already in use');
    }

    const existingUserByUsername =
      await this.userRepository.findByUsername(username);
    if (existingUserByUsername) {
      throw new AuthenticationException('Username already in use');
    }

    // Hash password
    const passwordHash = await this.credentialsService.hashPassword(password);

    // Create user
    const user = await this.userRepository.createUser({
      email,
      username,
      passwordHash,
    });

    // Generate verification token and send email
    const verificationToken =
      await this.credentialsService.generateVerificationToken(user.id);
    await this.credentialsService.sendVerificationEmail(
      email,
      verificationToken,
    );

    // Generate tokens
    const tokens = this.tokenService.generateTokens(
      user.id,
      user.username,
      user.email,
    );

    // Store refresh token
    await this.tokenService.storeRefreshToken(tokens.refreshToken, user.id);

    return tokens;
  }

  /**
   * Verify a user's email
   * @param verifyEmailDto Verification data
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    const { token } = verifyEmailDto;
    await this.credentialsService.verifyEmail(token);
  }

  /**
   * Resend verification email
   * @param resendVerificationDto Resend verification data
   */
  async resendVerificationEmail(
    resendVerificationDto: ResendVerificationDto,
  ): Promise<void> {
    const { email } = resendVerificationDto;
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new AuthenticationException('Email already verified');
    }

    const verificationToken =
      await this.credentialsService.generateVerificationToken(user.id);
    await this.credentialsService.sendVerificationEmail(
      email,
      verificationToken,
    );
  }

  /**
   * Request password reset
   * @param requestPasswordResetDto Password reset request data
   */
  async requestPasswordReset(
    requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<void> {
    const { email } = requestPasswordResetDto;
    const resetToken =
      await this.credentialsService.generatePasswordResetToken(email);
    await this.credentialsService.sendPasswordResetEmail(email, resetToken);
  }

  /**
   * Reset password
   * @param resetPasswordDto Password reset data
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, password } = resetPasswordDto;
    await this.credentialsService.resetPassword(token, password);
  }

  /**
   * Login a user
   * @param loginDto Login data
   * @returns Access and refresh tokens
   */
  async login(loginDto: LoginDto): Promise<TokensDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.credentialsService.verifyPassword(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new AuthenticationException('Invalid credentials');
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
  }

  /**
   * Refresh tokens
   * @param refreshTokenDto Refresh token data
   * @returns New access and refresh tokens
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<TokensDto> {
    const { refreshToken } = refreshTokenDto;

    // Validate refresh token
    const userId = await this.tokenService.validateRefreshToken(refreshToken);

    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthenticationException('Invalid refresh token');
    }

    // Revoke old refresh token
    await this.tokenService.revokeRefreshToken(refreshToken);

    // Generate new tokens
    const tokens = this.tokenService.generateTokens(
      user.id,
      user.username,
      user.email,
    );

    // Store new refresh token
    await this.tokenService.storeRefreshToken(tokens.refreshToken, user.id);

    return tokens;
  }

  /**
   * Logout a user
   * @param refreshToken Refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
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
