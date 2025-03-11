import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { CredentialsService } from './services/credentials.service';
import { SocialAuthService } from './services/social-auth.service';
import { UserRepository } from './repositories/user.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GitHubStrategy } from './strategies/github.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
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
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
    MailModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    CredentialsService,
    SocialAuthService,
    UserRepository,
    JwtStrategy,
    GoogleStrategy,
    GitHubStrategy,
    PrismaService,
    EmailVerifiedGuard,
  ],
  exports: [
    AuthService,
    TokenService,
    CredentialsService,
    SocialAuthService,
    UserRepository,
    JwtStrategy,
    PassportModule,
    EmailVerifiedGuard,
  ],
})
export class AuthModule {}
