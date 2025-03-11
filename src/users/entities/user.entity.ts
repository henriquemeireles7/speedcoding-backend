import { SocialMediaLinkDto } from '../dto/update-user.dto';

/**
 * User entity
 * Core domain entity representing a user in the system
 */
export class User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  preferences?: Record<string, any> | null;
  location?: string | null;
  website?: string | null;
  socialLinks?: SocialMediaLinkDto[] | null;
  skills?: string[] | null;
  createdAt: Date;
  updatedAt: Date;

  /**
   * Check if the user's email is verified
   * @returns True if the email is verified
   */
  isVerified(): boolean {
    return this.isEmailVerified;
  }

  /**
   * Check if the user has a verification token that is still valid
   * @returns True if the verification token is valid
   */
  hasValidVerificationToken(): boolean {
    return (
      !!this.verificationToken &&
      !!this.verificationTokenExpiry &&
      this.verificationTokenExpiry > new Date()
    );
  }

  /**
   * Check if the user has a reset token that is still valid
   * @returns True if the reset token is valid
   */
  hasValidResetToken(): boolean {
    return (
      !!this.resetToken &&
      !!this.resetTokenExpiry &&
      this.resetTokenExpiry > new Date()
    );
  }

  /**
   * Get the user's full name or username if display name is not set
   * @returns The user's display name or username
   */
  getDisplayName(): string {
    return this.displayName || this.username;
  }

  /**
   * Check if the user has completed their profile
   * @returns True if the user has completed their profile
   */
  hasCompletedProfile(): boolean {
    return !!(
      this.displayName &&
      this.bio &&
      this.avatarUrl &&
      this.location &&
      this.skills &&
      this.skills.length > 0
    );
  }
}
