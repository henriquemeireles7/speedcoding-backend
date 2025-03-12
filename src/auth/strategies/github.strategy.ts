import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { SocialUserDto } from '../dto/social-user.dto';

// Import the callback type from passport
type DoneCallback = (error: Error | null, user?: any) => void;

/**
 * GitHub OAuth strategy for authentication
 */
@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = configService.get<string>('GITHUB_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GITHUB_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing GitHub OAuth configuration');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
    });
  }

  /**
   * Validate the GitHub OAuth profile
   * @param accessToken Access token from GitHub
   * @param refreshToken Refresh token from GitHub
   * @param profile GitHub profile
   * @param done Callback function
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: DoneCallback,
  ): Promise<void> {
    try {
      // GitHub profile structure is different from Google
      const { emails, photos, displayName, username } = profile;

      // Extract email with proper null check
      const email =
        emails && emails.length > 0
          ? emails[0].value
          : username
            ? `${username}@github.com`
            : '';

      if (!email) {
        return done(new Error('No email found in GitHub profile'));
      }

      // Extract name parts from displayName (if available)
      let firstName = '';
      let lastName = '';

      if (displayName) {
        const nameParts = displayName.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      }

      // Extract picture with proper null check
      const picture = photos && photos.length > 0 ? photos[0].value : null;

      const socialUser: SocialUserDto = {
        email,
        firstName,
        lastName,
        picture,
        provider: 'github',
        providerId: profile.id,
        accessToken, // Include the accessToken as required by SocialUserDto
        username: username || email.split('@')[0],
      };

      // Process the user in the auth service
      const result = await this.authService.socialLogin(socialUser);
      done(null, result);
    } catch (error) {
      // Use proper error handling pattern
      done(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
