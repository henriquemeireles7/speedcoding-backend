import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

/**
 * GitHub OAuth strategy for authentication
 */
@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
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
    profile: any,
    done: Function,
  ): Promise<any> {
    // GitHub profile structure is different from Google
    const { emails, photos, displayName, username } = profile;

    // Extract name parts from displayName (if available)
    let firstName = '';
    let lastName = '';

    if (displayName) {
      const nameParts = displayName.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    }

    const user = {
      email:
        emails && emails.length > 0
          ? emails[0].value
          : `${username}@github.com`,
      firstName,
      lastName,
      picture: photos && photos.length > 0 ? photos[0].value : null,
      accessToken,
      provider: 'github',
      providerId: profile.id,
      username: username,
    };

    // Process the user in the auth service
    const result = await this.authService.socialLogin(user);

    done(null, result);
  }
}
