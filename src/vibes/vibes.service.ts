import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  VibeResponseDto,
  VibeDetailDto,
  VibeQueryDto,
  MilestoneInfoDto,
} from './dto';
import { Vibe } from '@prisma/client';

/**
 * Service for managing vibes
 */
@Injectable()
export class VibesService {
  private readonly logger = new Logger(VibesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get all vibes with pagination
   * @param queryDto Query parameters
   * @returns List of vibes
   */
  async getVibes(queryDto: VibeQueryDto): Promise<VibeResponseDto[]> {
    const { limit = 10, offset = 0 } = queryDto;

    this.logger.log(
      `Retrieving vibes with limit ${limit} and offset ${offset}`,
    );

    const vibes = await this.prisma.vibe.findMany({
      take: limit,
      skip: offset,
      orderBy: { name: 'asc' },
    });

    // For each vibe, count the number of milestones
    const vibesWithMilestoneCount = await Promise.all(
      vibes.map(async (vibe) => {
        // In a real implementation, this would query a milestones table
        // For now, we'll return a fixed count of 7 for all vibes
        const milestoneCount = 7;

        return this.mapVibeToResponseDto(vibe, milestoneCount);
      }),
    );

    return vibesWithMilestoneCount;
  }

  /**
   * Get a vibe by ID with its milestones
   * @param vibeId Vibe ID
   * @returns Vibe with milestones
   */
  async getVibe(vibeId: string): Promise<VibeDetailDto> {
    this.logger.log(`Retrieving vibe with ID ${vibeId}`);

    const vibe = await this.prisma.vibe.findUnique({
      where: { id: vibeId },
    });

    if (!vibe) {
      throw new NotFoundException(`Vibe with ID ${vibeId} not found`);
    }

    // In a real implementation, this would query a milestones table
    // For now, we'll return mock milestones
    const milestones: MilestoneInfoDto[] = [
      {
        index: 1,
        name: 'User Authentication',
        description: 'Implement login and registration',
      },
      {
        index: 2,
        name: 'Channel Management',
        description: 'Create and join channels',
      },
      {
        index: 3,
        name: 'Messaging',
        description: 'Send and receive messages',
      },
      {
        index: 4,
        name: 'Real-time Updates',
        description: 'Implement WebSockets for real-time messaging',
      },
      {
        index: 5,
        name: 'File Uploads',
        description: 'Allow users to upload and share files',
      },
      {
        index: 6,
        name: 'Search Functionality',
        description: 'Implement search for messages and channels',
      },
      {
        index: 7,
        name: 'AI Assistant',
        description: 'Add an AI assistant to help users',
      },
    ];

    return this.mapVibeToDetailDto(vibe, milestones);
  }

  /**
   * Map a Vibe entity to a VibeResponseDto
   * @param vibe Vibe entity
   * @param milestoneCount Number of milestones
   * @returns VibeResponseDto
   */
  private mapVibeToResponseDto(
    vibe: Vibe,
    milestoneCount: number,
  ): VibeResponseDto {
    return {
      id: vibe.id,
      name: vibe.name,
      description: vibe.description || '',
      milestoneCount,
      setupGuide: 'Run `npm init` and install dependencies', // Mock data
      createdAt: vibe.createdAt,
      updatedAt: vibe.updatedAt,
    };
  }

  /**
   * Map a Vibe entity to a VibeDetailDto
   * @param vibe Vibe entity
   * @param milestones List of milestones
   * @returns VibeDetailDto
   */
  private mapVibeToDetailDto(
    vibe: Vibe,
    milestones: MilestoneInfoDto[],
  ): VibeDetailDto {
    return {
      id: vibe.id,
      name: vibe.name,
      description: vibe.description || '',
      setupGuide: 'Run `npm init` and install dependencies', // Mock data
      milestones,
      createdAt: vibe.createdAt,
      updatedAt: vibe.updatedAt,
    };
  }
}
