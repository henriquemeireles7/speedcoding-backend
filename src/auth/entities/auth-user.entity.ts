import { User } from '../../users/entities/user.entity';
import { User as PrismaUser } from '@prisma/client';

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
  static fromDatabaseUser(data: PrismaUser): AuthUser {
    const authUser = new AuthUser();
    Object.assign(authUser, {
      id: data.id,
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      isEmailVerified: data.isEmailVerified,
      verificationToken: data.verificationToken,
      verificationTokenExpiry: data.verificationTokenExpiry,
      resetToken: data.resetToken,
      resetTokenExpiry: data.resetTokenExpiry,
      displayName: data.displayName,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      preferences: data.preferences,
      location: data.location,
      website: data.website,
      socialLinks: data.socialLinks,
      skills: data.skills,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return authUser;
  }
}
