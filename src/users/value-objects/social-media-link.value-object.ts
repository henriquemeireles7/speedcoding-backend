/**
 * Value object representing a social media link
 * Encapsulates validation and behavior for social media links
 */
export class SocialMediaLink {
  private readonly _platform: string;
  private readonly _url: string;

  /**
   * Create a new SocialMediaLink
   * @param platform Social media platform (e.g., 'github', 'twitter')
   * @param url URL to the social media profile
   */
  private constructor(platform: string, url: string) {
    this._platform = platform;
    this._url = url;
  }

  /**
   * Get the platform
   */
  get platform(): string {
    return this._platform;
  }

  /**
   * Get the URL
   */
  get url(): string {
    return this._url;
  }

  /**
   * Create a new SocialMediaLink
   * @param platform Social media platform
   * @param url URL to the social media profile
   * @returns New SocialMediaLink instance
   * @throws Error if validation fails
   */
  static create(platform: string, url: string): SocialMediaLink {
    // Validate platform
    if (!platform || platform.trim() === '') {
      throw new Error('Platform cannot be empty');
    }

    // Validate URL
    if (!url || url.trim() === '') {
      throw new Error('URL cannot be empty');
    }

    try {
      // Check if URL is valid
      new URL(url);
    } catch (error) {
      throw new Error('Invalid URL format');
    }

    return new SocialMediaLink(platform.toLowerCase().trim(), url.trim());
  }

  /**
   * Create a SocialMediaLink from a plain object
   * @param data Plain object with platform and url properties
   * @returns New SocialMediaLink instance
   */
  static fromObject(data: { platform: string; url: string }): SocialMediaLink {
    return SocialMediaLink.create(data.platform, data.url);
  }

  /**
   * Create multiple SocialMediaLink instances from an array of plain objects
   * @param data Array of plain objects with platform and url properties
   * @returns Array of SocialMediaLink instances
   */
  static fromArray(
    data: { platform: string; url: string }[],
  ): SocialMediaLink[] {
    return data.map((item) => SocialMediaLink.fromObject(item));
  }

  /**
   * Convert to a plain object for serialization
   * @returns Plain object representation
   */
  toObject(): { platform: string; url: string } {
    return {
      platform: this._platform,
      url: this._url,
    };
  }

  /**
   * Check if this SocialMediaLink is equal to another
   * @param other Another SocialMediaLink
   * @returns True if equal
   */
  equals(other: SocialMediaLink): boolean {
    return this._platform === other._platform && this._url === other._url;
  }

  /**
   * Get a formatted display string
   * @returns Formatted string
   */
  toString(): string {
    return `${this._platform}: ${this._url}`;
  }
}
