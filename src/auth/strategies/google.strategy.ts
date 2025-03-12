import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { SocialUserDto } from '../dto/social-user.dto';

/**
 * Google OAuth2 strategy for authentication
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing Google OAuth configuration');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  /**
   * Validate the Google OAuth2 profile
   * @param accessToken Access token from Google
   * @param refreshToken Refresh token from Google
   * @param profile Google profile
   * @param done Callback function
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      // Extract profile data with proper null checks
      const email =
        profile.emails && profile.emails[0] ? profile.emails[0].value : '';
      const firstName = profile.name?.givenName || '';
      const lastName = profile.name?.familyName || '';
      const picture =
        profile.photos && profile.photos[0] ? profile.photos[0].value : null;

      if (!email) {
        return done(new Error('No email found in Google profile'));
      }

      const socialUser: SocialUserDto = {
        email,
        firstName,
        lastName,
        picture,
        provider: 'google',
        providerId: profile.id,
        // Include accessToken as required by SocialUserDto
        accessToken,
        username: profile.displayName || email.split('@')[0],
      };

      // Process the user in the auth service
      const result = await this.authService.socialLogin(socialUser);
      done(null, result);
    } catch (error) {
      // Use undefined instead of null for failed auth (per passport docs)
      done(error);
    }
  }
}
