import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto';
import * as bcrypt from 'bcrypt';

/**
 * Authentication Service
 * Handles user authentication and JWT token generation
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Authenticate a user and generate a JWT token
   * @param loginDto Login credentials
   * @returns JWT token
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Find the user by username
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    // If user doesn't exist or password doesn't match, throw an error
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate a JWT token
    const payload = {
      sub: user.id,
      username: user.username,
    };

    return {
      token: this.jwtService.sign(payload),
    };
  }
}
