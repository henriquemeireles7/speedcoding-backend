import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
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
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
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
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    const socialUser: SocialUserDto = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      provider: 'google',
      providerId: profile.id,
    };

    try {
      // Process the user in the auth service
      const result = await this.authService.socialLogin(socialUser);
      done(null, result);
    } catch (error) {
      done(error, null);
    }
  }
}
