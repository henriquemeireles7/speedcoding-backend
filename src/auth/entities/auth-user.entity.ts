import { User } from '../../users/entities/user.entity';

/**
 * Auth User entity
 * Extends the base User entity with authentication-specific functionality
 */
export class AuthUser extends User {
  /**
   * Check if the user can login
   * @returns True if the user can login
   */
  canLogin(): boolean {
    return true; // Add any login restrictions here if needed
  }

  /**
   * Check if the user requires email verification before login
   * @returns True if email verification is required
   */
  requiresEmailVerification(): boolean {
    return !this.isEmailVerified;
  }

  /**
   * Check if the user's verification token has expired
   * @returns True if the verification token has expired
   */
  isVerificationTokenExpired(): boolean {
    return (
      !!this.verificationToken &&
      !!this.verificationTokenExpiry &&
      this.verificationTokenExpiry < new Date()
    );
  }

  /**
   * Check if the user's reset token has expired
   * @returns True if the reset token has expired
   */
  isResetTokenExpired(): boolean {
    return (
      !!this.resetToken &&
      !!this.resetTokenExpiry &&
      this.resetTokenExpiry < new Date()
    );
  }

  /**
   * Create a new instance from a database user object
   * @param data User data from database
   * @returns AuthUser instance
   */
  static fromDatabaseUser(data: any): AuthUser {
    const authUser = new AuthUser();
    Object.assign(authUser, data);
    return authUser;
  }
}
