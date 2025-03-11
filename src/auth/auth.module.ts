import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { CredentialsService } from './services/credentials.service';
import { SocialAuthService } from './services/social-auth.service';
import { LoginService } from './services/login.service';
import { RegisterService } from './services/register.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GitHubStrategy } from './strategies/github.strategy';
import { UserRepository } from './repositories/user.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../prisma/prisma.service';
import { EmailVerifiedGuard } from './guards/email-verified.guard';

/**
 * Authentication module
 * Provides authentication services and controllers
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    CredentialsService,
    SocialAuthService,
    LoginService,
    RegisterService,
    JwtStrategy,
    GoogleStrategy,
    GitHubStrategy,
    UserRepository,
    RefreshTokenRepository,
    PrismaService,
    EmailVerifiedGuard,
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
