import { User } from '../../users/entities/user.entity';
import { User as PrismaUser } from '@prisma/client';
import { SocialMediaLink, UserPreferences } from '../../users/value-objects';

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

    // Map primitive properties
    authUser.id = data.id;
    authUser.username = data.username;
    authUser.email = data.email;
    authUser.passwordHash = data.passwordHash;
    authUser.isEmailVerified = data.isEmailVerified;
    authUser.verificationToken = data.verificationToken;
    authUser.verificationTokenExpiry = data.verificationTokenExpiry;
    authUser.resetToken = data.resetToken;
    authUser.resetTokenExpiry = data.resetTokenExpiry;
    authUser.displayName = data.displayName;
    authUser.bio = data.bio;
    authUser.avatarUrl = data.avatarUrl;
    authUser.location = data.location;
    authUser.website = data.website;
    authUser.createdAt = data.createdAt;
    authUser.updatedAt = data.updatedAt;

    // Map value objects
    if (data.preferences) {
      try {
        // Type assertion for preferences
        const prefsData: unknown =
          typeof data.preferences === 'string'
            ? JSON.parse(data.preferences)
            : data.preferences;

        authUser.preferences = UserPreferences.fromObject(
          prefsData as Record<string, unknown>,
        );
      } catch {
        // If preferences can't be parsed, set to null
        authUser.preferences = null;
      }
    }

    if (data.socialLinks) {
      try {
        // Type assertion for socialLinks
        const linksData: unknown =
          typeof data.socialLinks === 'string'
            ? JSON.parse(data.socialLinks)
            : data.socialLinks;

        if (Array.isArray(linksData)) {
          // Type guard function to ensure each item has the correct shape
          const isValidLink = (
            item: unknown,
          ): item is { platform: string; url: string } => {
            return (
              typeof item === 'object' &&
              item !== null &&
              'platform' in item &&
              'url' in item &&
              typeof (item as Record<string, unknown>).platform === 'string' &&
              typeof (item as Record<string, unknown>).url === 'string'
            );
          };

          authUser.socialLinks = linksData
            .filter(isValidLink)
            .map((link) => SocialMediaLink.create(link.platform, link.url));
        }
      } catch {
        // If socialLinks can't be parsed, set to empty array
        authUser.socialLinks = [];
      }
    }

    if (data.skills) {
      try {
        // Type assertion for skills
        const skillsData: unknown =
          typeof data.skills === 'string'
            ? JSON.parse(data.skills)
            : data.skills;

        if (Array.isArray(skillsData)) {
          authUser.skills = skillsData.map((skill) => String(skill));
        }
      } catch {
        // If skills can't be parsed, set to empty array
        authUser.skills = [];
      }
    }

    return authUser;
  }
}
