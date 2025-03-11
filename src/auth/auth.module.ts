import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from '../mail/mail.module';
import { EmailVerifiedGuard } from './guards/email-verified.guard';

/**
 * Authentication Module
 * Handles user authentication and JWT token generation
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret', // Use environment variable or default
      signOptions: { expiresIn: '24h' }, // Token expires in 24 hours
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, EmailVerifiedGuard],
  exports: [JwtStrategy, PassportModule, EmailVerifiedGuard],
})
export class AuthModule {}
