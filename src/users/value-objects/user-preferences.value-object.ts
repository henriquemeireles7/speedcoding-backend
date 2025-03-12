/**
 * Value object representing user preferences
 * Encapsulates validation and behavior for user preferences
 */
export class UserPreferences {
  private readonly _theme: string;
  private readonly _notifications: boolean;
  private readonly _language: string;
  private readonly _timezone: string;
  private readonly _additionalPreferences: Record<string, any>;

  /**
   * Create a new UserPreferences
   * @param theme UI theme (e.g., 'light', 'dark')
   * @param notifications Whether notifications are enabled
   * @param language Preferred language
   * @param timezone Preferred timezone
   * @param additionalPreferences Additional custom preferences
   */
  private constructor(
    theme: string,
    notifications: boolean,
    language: string,
    timezone: string,
    additionalPreferences: Record<string, any> = {},
  ) {
    this._theme = theme;
    this._notifications = notifications;
    this._language = language;
    this._timezone = timezone;
    this._additionalPreferences = { ...additionalPreferences };
  }

  /**
   * Get the theme
   */
  get theme(): string {
    return this._theme;
  }

  /**
   * Get the notifications setting
   */
  get notifications(): boolean {
    return this._notifications;
  }

  /**
   * Get the language
   */
  get language(): string {
    return this._language;
  }

  /**
   * Get the timezone
   */
  get timezone(): string {
    return this._timezone;
  }

  /**
   * Get additional preferences
   */
  get additionalPreferences(): Record<string, any> {
    return { ...this._additionalPreferences };
  }

  /**
   * Get a specific additional preference
   * @param key Preference key
   * @returns Preference value or undefined if not found
   */
  getPreference(key: string): any {
    return this._additionalPreferences[key];
  }

  /**
   * Create a new UserPreferences
   * @param theme UI theme
   * @param notifications Whether notifications are enabled
   * @param language Preferred language
   * @param timezone Preferred timezone
   * @param additionalPreferences Additional custom preferences
   * @returns New UserPreferences instance
   * @throws Error if validation fails
   */
  static create(
    theme: string = 'light',
    notifications: boolean = true,
    language: string = 'en',
    timezone: string = 'UTC',
    additionalPreferences: Record<string, any> = {},
  ): UserPreferences {
    // Validate theme
    const validThemes = ['light', 'dark', 'system'];
    if (!validThemes.includes(theme.toLowerCase())) {
      throw new Error(
        `Invalid theme. Must be one of: ${validThemes.join(', ')}`,
      );
    }

    // Validate language (simple ISO language code validation)
    if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(language)) {
      throw new Error(
        'Invalid language format. Use ISO format (e.g., "en" or "en-US")',
      );
    }

    // Validate timezone (simple check)
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
    } catch (error) {
      throw new Error('Invalid timezone');
    }

    return new UserPreferences(
      theme.toLowerCase(),
      notifications,
      language,
      timezone,
      additionalPreferences,
    );
  }

  /**
   * Create UserPreferences from a plain object
   * @param data Plain object with preferences
   * @returns New UserPreferences instance
   */
  static fromObject(data: Record<string, any>): UserPreferences {
    const {
      theme = 'light',
      notifications = true,
      language = 'en',
      timezone = 'UTC',
      ...additionalPreferences
    } = data || {};

    return UserPreferences.create(
      theme,
      notifications,
      language,
      timezone,
      additionalPreferences,
    );
  }

  /**
   * Create UserPreferences from JSON
   * @param json JSON string or already parsed object
   * @returns New UserPreferences instance
   */
  static fromJSON(json: string | Record<string, any>): UserPreferences {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return UserPreferences.fromObject(data);
  }

  /**
   * Convert to a plain object for serialization
   * @returns Plain object representation
   */
  toObject(): Record<string, any> {
    return {
      theme: this._theme,
      notifications: this._notifications,
      language: this._language,
      timezone: this._timezone,
      ...this._additionalPreferences,
    };
  }

  /**
   * Convert to JSON string
   * @returns JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.toObject());
  }

  /**
   * Create a new UserPreferences with updated values
   * @param updates Partial updates to apply
   * @returns New UserPreferences instance
   */
  update(
    updates: Partial<{
      theme: string;
      notifications: boolean;
      language: string;
      timezone: string;
      additionalPreferences: Record<string, any>;
    }>,
  ): UserPreferences {
    const additionalPreferences = {
      ...this._additionalPreferences,
      ...(updates.additionalPreferences || {}),
    };

    return UserPreferences.create(
      updates.theme || this._theme,
      updates.notifications !== undefined
        ? updates.notifications
        : this._notifications,
      updates.language || this._language,
      updates.timezone || this._timezone,
      additionalPreferences,
    );
  }

  /**
   * Check if this UserPreferences is equal to another
   * @param other Another UserPreferences
   * @returns True if equal
   */
  equals(other: UserPreferences): boolean {
    return (
      this._theme === other._theme &&
      this._notifications === other._notifications &&
      this._language === other._language &&
      this._timezone === other._timezone &&
      JSON.stringify(this._additionalPreferences) ===
        JSON.stringify(other._additionalPreferences)
    );
  }
}
