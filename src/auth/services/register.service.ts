import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { TokensDto } from '../dto/tokens.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerificationDto } from '../dto/resend-verification.dto';
import { RequestPasswordResetDto } from '../dto/request-password-reset.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { TokenService } from './token.service';
import { CredentialsService } from './credentials.service';
import { UserRepository } from '../repositories/user.repository';
import { AuthenticationException, UserNotFoundException } from '../exceptions';

/**
 * Service responsible for handling user registration
 * Manages registration, email verification, and password reset
 */
@Injectable()
export class RegisterService {
  constructor(
    private tokenService: TokenService,
    private credentialsService: CredentialsService,
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
    const { token, newPassword } = resetPasswordDto;
    await this.credentialsService.resetPassword(token, newPassword);
  }
}
