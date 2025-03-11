import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Repository for managing refresh tokens
 */
@Injectable()
export class RefreshTokenRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new refresh token
   * @param token The refresh token
   * @param userId The user ID
   * @param expiresAt The expiration date
   * @returns The created refresh token
   */
  async create(token: string, userId: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  /**
   * Find a refresh token by its value
   * @param token The refresh token
   * @returns The refresh token or null
   */
  async findByToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  /**
   * Delete a refresh token
   * @param token The refresh token
   */
  async delete(token: string) {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  /**
   * Delete all refresh tokens for a user
   * @param userId The user ID
   */
  async deleteAllForUser(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Delete expired refresh tokens
   */
  async deleteExpired() {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
