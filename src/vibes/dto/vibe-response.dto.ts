import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for vibe responses
 */
export class VibeResponseDto {
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

  @ApiProperty({ description: 'Number of milestones in the vibe', example: 7 })
  milestoneCount: number;

  @ApiProperty({
    description: 'Setup guide for the vibe',
    example: 'Run `npm init` and install dependencies',
  })
  setupGuide: string;

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
