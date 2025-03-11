import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for milestone information
 */
export class MilestoneInfoDto {
  @ApiProperty({ description: 'Milestone index', example: 1 })
  index: number;

  @ApiProperty({
    description: 'Milestone name',
    example: 'User Authentication',
  })
  name: string;

  @ApiProperty({
    description: 'Milestone description',
    example: 'Implement login',
  })
  description: string;
}

/**
 * Data Transfer Object for detailed vibe responses
 */
export class VibeDetailDto {
  @ApiProperty({
    description: 'Unique identifier for the vibe',
    example: 'uuid-of-vibe',
  })
  id: string;

  @ApiProperty({ description: 'Name of the vibe', example: 'Slack Clone' })
  name: string;

  @ApiProperty({
    description: 'Description of the vibe',
    example: 'Build a real-time chat app with AI',
  })
  description: string;

  @ApiProperty({
    description: 'Setup guide for the vibe',
    example: 'Run `npm init` and install dependencies',
  })
  setupGuide: string;

  @ApiProperty({
    description: 'List of milestones for the vibe',
    type: [MilestoneInfoDto],
  })
  milestones: MilestoneInfoDto[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-03-11T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-03-11T12:00:00.000Z',
  })
  updatedAt: Date;
}
