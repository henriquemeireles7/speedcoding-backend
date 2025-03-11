import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

/**
 * Service for sending emails
 */
@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not set. Email functionality will be limited.',
      );
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@speedcoding.app';
    this.frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  /**
   * Send a verification email to a user
   * @param email User's email address
   * @param username User's username
   * @param token Verification token
   */
  async sendVerificationEmail(
    email: string,
    username: string,
    token: string,
  ): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Verify your SpeedCoding account',
        html: `
          <h1>Welcome to SpeedCoding, ${username}!</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <p><a href="${verificationUrl}">Verify Email</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        `,
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send a password reset email to a user
   * @param email User's email address
   * @param username User's username
   * @param token Reset token
   */
  async sendPasswordResetEmail(
    email: string,
    username: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Reset your SpeedCoding password',
        html: `
          <h1>Password Reset Request</h1>
          <p>Hello ${username},</p>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
        `,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      throw new Error('Failed to send password reset email');
    }
  }
}
