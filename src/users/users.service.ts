import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { SocialMediaLinkDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';

/**
 * Service for managing user profiles
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find a user by ID
   * @param id User ID
   * @returns User entity
   */
  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user as unknown as User;
  }

  /**
   * Find a user by email
   * @param email Email address
   * @returns User entity or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user as unknown as User;
  }

  /**
   * Find a user by username
   * @param username Username
   * @returns User entity or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    return user as unknown as User;
  }

  /**
   * Update a user's profile
   * @param id User ID
   * @param updateUserDto Updated user data
   * @returns Updated user entity
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    await this.findById(id);

    // Prepare the update data
    const { socialLinks, ...restOfData } = updateUserDto;

    // Create the update input with proper typing
    const updateData: Prisma.UserUpdateInput = {
      ...restOfData,
      // Handle socialLinks separately with proper typing for JSON field
      ...(socialLinks && {
        socialLinks: JSON.parse(JSON.stringify(socialLinks)),
      }),
    };

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return updatedUser as unknown as User;
  }

  /**
   * Remove a user and all related data
   * @param id User ID
   */
  async remove(id: string): Promise<void> {
    // Check if user exists
    await this.findById(id);

    // Delete user and all related data in a transaction
    await this.prisma.$transaction(async (prisma) => {
      // Delete refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId: id },
      });

      // Delete runs and related data
      const runs = await prisma.run.findMany({
        where: { userId: id },
        select: { id: true },
      });

      for (const run of runs) {
        // Delete milestones
        await prisma.milestone.deleteMany({
          where: { runId: run.id },
        });

        // Delete submissions
        await prisma.submission.deleteMany({
          where: { runId: run.id },
        });
      }

      // Delete runs
      await prisma.run.deleteMany({
        where: { userId: id },
      });

      // Delete user
      await prisma.user.delete({
        where: { id },
      });
    });
  }

  /**
   * Get user statistics
   * @param userId User ID
   * @returns User statistics
   */
  async getUserStats(userId: string): Promise<any> {
    // Get total runs
    const totalRuns = await this.prisma.run.count({
      where: { userId },
    });

    // Get completed runs
    const completedRuns = await this.prisma.run.count({
      where: {
        userId,
        completed: true,
      },
    });

    // Get fastest run
    const fastestRun = await this.prisma.run.findFirst({
      where: {
        userId,
        completed: true,
      },
      orderBy: {
        totalTimeInSeconds: 'asc',
      },
      select: {
        id: true,
        totalTimeInSeconds: true,
        techStack: true,
        vibeId: true,
      },
    });

    // Get vibe details for fastest run
    let vibeName: string | null = null;
    if (fastestRun && fastestRun.vibeId) {
      const vibe = await this.prisma.vibe.findUnique({
        where: { id: fastestRun.vibeId },
        select: { name: true },
      });
      vibeName = vibe ? vibe.name : null;
    }

    return {
      totalRuns,
      completedRuns,
      completionRate: totalRuns > 0 ? (completedRuns / totalRuns) * 100 : 0,
      fastestRun: fastestRun
        ? {
            id: fastestRun.id,
            time: fastestRun.totalTimeInSeconds,
            techStack: fastestRun.techStack,
            vibe: vibeName,
          }
        : null,
    };
  }

  /**
   * Get user runs
   * @param userId User ID
   * @param limit Maximum number of runs to return
   * @param offset Number of runs to skip
   * @returns Array of user runs
   */
  async getUserRuns(userId: string, limit = 10, offset = 0): Promise<any[]> {
    const runs = await this.prisma.run.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        vibe: {
          select: { name: true },
        },
      },
    });

    return runs;
  }

  /**
   * Map a User entity to a UserResponseDto
   * @param user User entity
   * @returns UserResponseDto
   */
  mapToDto(user: User): UserResponseDto {
    const dto: UserResponseDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      preferences: user.preferences,
      location: user.location,
      website: user.website,
      socialLinks: user.socialLinks as unknown as SocialMediaLinkDto[] | null,
      skills: user.skills,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return dto;
  }
}
