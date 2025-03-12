import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../../mail/mail.service';
import { UserRepository } from '../repositories/user.repository';
import { AuthenticationException } from '../exceptions/authentication.exception';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

/**
 * Service responsible for handling user credentials
 * Manages password hashing, verification, email verification, and password reset
 */
@Injectable()
export class CredentialsService {
  constructor(
    private configService: ConfigService,
    private mailService: MailService,
    private userRepository: UserRepository,
  ) {}

  /**
   * Hash a password
   * @param password Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password
   * @param plainPassword Plain text password
   * @param hashedPassword Hashed password
   * @returns True if password matches
   */
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generate a verification token for email verification
   * @param userId User ID
   * @returns Verification token
   */
  async generateVerificationToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiryHours = this.configService.get<number>(
      'VERIFICATION_TOKEN_EXPIRY_HOURS',
      24,
    );
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiryHours);

    await this.userRepository.setVerificationToken(userId, token, expiryDate);
    return token;
  }

  /**
   * Send a verification email
   * @param email User email
   * @param token Verification token
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException('User not found');
    }

    await this.mailService.sendVerificationEmail(
      email,
      user.username,
      verificationUrl,
    );
  }

  /**
   * Verify an email with a verification token
   * @param token Verification token
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findByVerificationToken(token);

    if (!user) {
      throw new UserNotFoundException('User not found or token is invalid');
    }

    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < new Date()
    ) {
      throw new AuthenticationException('Verification token has expired');
    }

    await this.userRepository.markEmailAsVerified(user.id);
  }

  /**
   * Generate a password reset token
   * @param email User email
   * @returns Password reset token
   */
  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundException('User not found');
    }

    const token = uuidv4();
    const expiryHours = this.configService.get<number>(
      'RESET_TOKEN_EXPIRY_HOURS',
      1,
    );
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiryHours);

    await this.userRepository.setResetToken(user.id, token, expiryDate);
    return token;
  }

  /**
   * Send a password reset email
   * @param email User email
   * @param token Password reset token
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException('User not found');
    }

    await this.mailService.sendPasswordResetEmail(
      email,
      user.username,
      resetUrl,
    );
  }

  /**
   * Reset a password with a reset token
   * @param token Password reset token
   * @param newPassword New password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByResetToken(token);

    if (!user) {
      throw new UserNotFoundException('User not found or token is invalid');
    }

    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      throw new AuthenticationException('Reset token has expired');
    }

    const passwordHash = await this.hashPassword(newPassword);
    await this.userRepository.updatePassword(user.id, passwordHash);
  }
}
