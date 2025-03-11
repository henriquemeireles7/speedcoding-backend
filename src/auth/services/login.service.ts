import { Injectable } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { TokensDto } from '../dto/tokens.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { TokenService } from './token.service';
import { CredentialsService } from './credentials.service';
import { UserRepository } from '../repositories/user.repository';
import { AuthenticationException } from '../exceptions';
import { AuthUser } from '../entities/auth-user.entity';

/**
 * Service responsible for handling user login
 * Manages login, token refresh, and logout
 */
@Injectable()
export class LoginService {
  constructor(
    private tokenService: TokenService,
    private credentialsService: CredentialsService,
    private userRepository: UserRepository,
  ) {}

  /**
   * Login a user
   * @param loginDto Login data
   * @returns Access and refresh tokens
   */
  async login(loginDto: LoginDto): Promise<TokensDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.credentialsService.verifyPassword(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new AuthenticationException('Invalid credentials');
    }

    // Generate tokens
    return this.generateAndStoreTokens(user);
  }

  /**
   * Refresh tokens
   * @param refreshTokenDto Refresh token data
   * @returns New access and refresh tokens
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<TokensDto> {
    const { refreshToken } = refreshTokenDto;

    // Validate refresh token
    const userId = await this.tokenService.validateRefreshToken(refreshToken);

    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthenticationException('Invalid refresh token');
    }

    // Revoke old refresh token
    await this.tokenService.revokeRefreshToken(refreshToken);

    // Generate new tokens
    return this.generateAndStoreTokens(user);
  }

  /**
   * Logout a user
   * @param refreshToken Refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  /**
   * Generate tokens and store refresh token
   * @param user User entity
   * @returns Access and refresh tokens
   */
  private async generateAndStoreTokens(user: AuthUser): Promise<TokensDto> {
    // Generate tokens
    const tokens = this.tokenService.generateTokens(
      user.id,
      user.username,
      user.email,
    );

    // Store refresh token
    await this.tokenService.storeRefreshToken(tokens.refreshToken, user.id);

    return tokens;
  }
}
