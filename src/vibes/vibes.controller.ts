import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { VibesService } from './vibes.service';
import { VibeResponseDto, VibeDetailDto, VibeQueryDto } from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

/**
 * Controller for managing vibes
 */
@ApiTags('vibes')
@Controller('vibes')
export class VibesController {
  constructor(private vibesService: VibesService) {}

  /**
   * Get all vibes with pagination
   * @param queryDto Query parameters
   * @returns List of vibes
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all vibes',
    description:
      'Retrieves a list of all available Vibes (full-stack app challenges)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of vibes to return',
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of vibes to skip',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of vibes',
    type: [VibeResponseDto],
  })
  async getVibes(@Query() queryDto: VibeQueryDto): Promise<VibeResponseDto[]> {
    return this.vibesService.getVibes(queryDto);
  }

  /**
   * Get a vibe by ID with its milestones
   * @param vibeId Vibe ID
   * @returns Vibe with milestones
   */
  @Get(':vibeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a vibe by ID',
    description: 'Fetches details of a specific Vibe, including its milestones',
  })
  @ApiParam({ name: 'vibeId', description: 'Vibe ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Vibe with milestones',
    type: VibeDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Vibe not found' })
  async getVibe(@Param('vibeId') vibeId: string): Promise<VibeDetailDto> {
    try {
      return await this.vibesService.getVibe(vibeId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Vibe with ID ${vibeId} not found`);
    }
  }
}
