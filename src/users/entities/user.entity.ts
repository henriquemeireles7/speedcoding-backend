import { SocialMediaLink, UserPreferences } from '../value-objects';

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
  preferences?: UserPreferences | null;
  location?: string | null;
  website?: string | null;
  socialLinks?: SocialMediaLink[] | null;
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

  /**
   * Get user's theme preference
   * @returns Theme preference or default
   */
  getTheme(): string {
    return this.preferences?.theme || 'light';
  }

  /**
   * Get user's notification preference
   * @returns Notification preference or default
   */
  getNotificationsEnabled(): boolean {
    return this.preferences?.notifications ?? true;
  }

  /**
   * Add a social media link
   * @param platform Social media platform
   * @param url URL to the social media profile
   */
  addSocialLink(platform: string, url: string): void {
    const newLink = SocialMediaLink.create(platform, url);

    if (!this.socialLinks) {
      this.socialLinks = [newLink];
      return;
    }

    // Check if link for this platform already exists
    const existingIndex = this.socialLinks.findIndex(
      (link) => link.platform === newLink.platform,
    );

    if (existingIndex >= 0) {
      // Replace existing link
      this.socialLinks[existingIndex] = newLink;
    } else {
      // Add new link
      this.socialLinks.push(newLink);
    }
  }

  /**
   * Remove a social media link
   * @param platform Social media platform
   * @returns True if removed, false if not found
   */
  removeSocialLink(platform: string): boolean {
    if (!this.socialLinks) {
      return false;
    }

    const initialLength = this.socialLinks.length;
    this.socialLinks = this.socialLinks.filter(
      (link) => link.platform !== platform,
    );

    return initialLength !== this.socialLinks.length;
  }

  /**
   * Update user preferences
   * @param preferencesData New preferences data
   */
  updatePreferences(preferencesData: Record<string, any>): void {
    if (!this.preferences) {
      this.preferences = UserPreferences.fromObject(preferencesData);
    } else {
      this.preferences = this.preferences.update({
        additionalPreferences: preferencesData,
      });
    }
  }

  /**
   * Set specific preference
   * @param key Preference key
   * @param value Preference value
   */
  setPreference(key: string, value: unknown): void {
    const currentPrefs = this.preferences?.toObject() || {};
    this.updatePreferences({ ...currentPrefs, [key]: value });
  }
}
