import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { TokensDto } from '../dto/tokens.dto';
import { UserRepository } from '../repositories/user.repository';
import { RefreshTokenPayload } from '../types/jwt-payload';

/**
 * Service responsible for handling JWT tokens
 * Manages token generation, validation, storage, and revocation
 */
@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {}

  /**
   * Generate access and refresh tokens for a user
   * @param userId User ID
   * @param username Username
   * @param email User email
   * @returns Access and refresh tokens
   */
  generateTokens(userId: string, username: string, email: string): TokensDto {
    const accessToken = this.generateAccessToken(userId, username, email);
    const refreshToken = this.generateRefreshToken(userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Generate an access token
   * @param userId User ID
   * @param username Username
   * @param email User email
   * @returns JWT access token
   */
  private generateAccessToken(
    userId: string,
    username: string,
    email: string,
  ): string {
    const payload = {
      sub: userId,
      username,
      email,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    });
  }

  /**
   * Generate a refresh token
   * @param userId User ID
   * @returns JWT refresh token
   */
  private generateRefreshToken(userId: string): string {
    const payload = {
      sub: userId,
      tokenId: uuidv4(),
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
  }

  /**
   * Store a refresh token in the database
   * @param refreshToken Refresh token
   * @param userId User ID
   */
  async storeRefreshToken(refreshToken: string, userId: string): Promise<void> {
    const decoded: unknown = this.jwtService.decode(refreshToken);

    // Validate token structure
    if (!this.isValidRefreshTokenPayload(decoded)) {
      throw new Error('Invalid refresh token');
    }

    const expiresAt = new Date(decoded.exp * 1000);
    await this.userRepository.storeRefreshToken(
      refreshToken,
      userId,
      expiresAt,
    );
  }

  /**
   * Validate a refresh token
   * @param refreshToken Refresh token
   * @returns User ID if token is valid
   */
  async validateRefreshToken(refreshToken: string): Promise<string> {
    try {
      const payload: unknown = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Validate token structure
      if (!this.isValidRefreshTokenPayload(payload)) {
        throw new Error('Invalid refresh token');
      }

      // Check if token exists in database and is not revoked
      const isValid =
        await this.userRepository.validateRefreshToken(refreshToken);

      if (!isValid) {
        throw new Error('Invalid refresh token');
      }

      return payload.sub;
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Type guard to validate refresh token payload
   * @param payload Any value to check
   * @returns True if payload has the expected structure
   */
  private isValidRefreshTokenPayload(
    payload: unknown,
  ): payload is RefreshTokenPayload {
    return (
      !!payload &&
      typeof payload === 'object' &&
      'sub' in payload &&
      typeof payload.sub === 'string' &&
      'exp' in payload &&
      typeof payload.exp === 'number'
    );
  }

  /**
   * Revoke a refresh token
   * @param refreshToken Refresh token
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.userRepository.revokeRefreshToken(refreshToken);
  }

  /**
   * Revoke all refresh tokens for a user
   * @param userId User ID
   */
  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.userRepository.revokeAllUserRefreshTokens(userId);
  }
}
