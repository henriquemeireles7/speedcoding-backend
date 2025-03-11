import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifyMilestoneDto, MilestoneResponseDto } from './dto';
import { Request } from 'express';

/**
 * Controller for managing milestones
 */
@Controller('verify')
@UseGuards(JwtAuthGuard)
export class MilestonesController {
  constructor(private milestonesService: MilestonesService) {}

  /**
   * Verify milestone 1
   * @param req Request object
   * @param verifyMilestoneDto Milestone data
   * @returns Verified milestone
   */
  @Post('m1')
  @HttpCode(HttpStatus.OK)
  async verifyM1(
    @Req() req: Request & { user: { id: string } },
    @Body() verifyMilestoneDto: VerifyMilestoneDto,
  ): Promise<MilestoneResponseDto> {
    return this.milestonesService.verifyMilestone(
      req.user.id,
      1,
      verifyMilestoneDto,
    );
  }

  /**
   * Verify milestone 2
   * @param req Request object
   * @param verifyMilestoneDto Milestone data
   * @returns Verified milestone
   */
  @Post('m2')
  @HttpCode(HttpStatus.OK)
  async verifyM2(
    @Req() req: Request & { user: { id: string } },
    @Body() verifyMilestoneDto: VerifyMilestoneDto,
  ): Promise<MilestoneResponseDto> {
    return this.milestonesService.verifyMilestone(
      req.user.id,
      2,
      verifyMilestoneDto,
    );
  }

  /**
   * Verify milestone 3
   * @param req Request object
   * @param verifyMilestoneDto Milestone data
   * @returns Verified milestone
   */
  @Post('m3')
  @HttpCode(HttpStatus.OK)
  async verifyM3(
    @Req() req: Request & { user: { id: string } },
    @Body() verifyMilestoneDto: VerifyMilestoneDto,
  ): Promise<MilestoneResponseDto> {
    return this.milestonesService.verifyMilestone(
      req.user.id,
      3,
      verifyMilestoneDto,
    );
  }

  /**
   * Verify milestone 4
   * @param req Request object
   * @param verifyMilestoneDto Milestone data
   * @returns Verified milestone
   */
  @Post('m4')
  @HttpCode(HttpStatus.OK)
  async verifyM4(
    @Req() req: Request & { user: { id: string } },
    @Body() verifyMilestoneDto: VerifyMilestoneDto,
  ): Promise<MilestoneResponseDto> {
    return this.milestonesService.verifyMilestone(
      req.user.id,
      4,
      verifyMilestoneDto,
    );
  }

  /**
   * Verify milestone 5
   * @param req Request object
   * @param verifyMilestoneDto Milestone data
   * @returns Verified milestone
   */
  @Post('m5')
  @HttpCode(HttpStatus.OK)
  async verifyM5(
    @Req() req: Request & { user: { id: string } },
    @Body() verifyMilestoneDto: VerifyMilestoneDto,
  ): Promise<MilestoneResponseDto> {
    return this.milestonesService.verifyMilestone(
      req.user.id,
      5,
      verifyMilestoneDto,
    );
  }

  /**
   * Verify milestone 6
   * @param req Request object
   * @param verifyMilestoneDto Milestone data
   * @returns Verified milestone
   */
  @Post('m6')
  @HttpCode(HttpStatus.OK)
  async verifyM6(
    @Req() req: Request & { user: { id: string } },
    @Body() verifyMilestoneDto: VerifyMilestoneDto,
  ): Promise<MilestoneResponseDto> {
    return this.milestonesService.verifyMilestone(
      req.user.id,
      6,
      verifyMilestoneDto,
    );
  }

  /**
   * Verify milestone 7
   * @param req Request object
   * @param verifyMilestoneDto Milestone data
   * @returns Verified milestone
   */
  @Post('m7')
  @HttpCode(HttpStatus.OK)
  async verifyM7(
    @Req() req: Request & { user: { id: string } },
    @Body() verifyMilestoneDto: VerifyMilestoneDto,
  ): Promise<MilestoneResponseDto> {
    return this.milestonesService.verifyMilestone(
      req.user.id,
      7,
      verifyMilestoneDto,
    );
  }

  /**
   * Get all milestones for a run
   * @param req Request object
   * @param runId Run ID
   * @returns List of milestones
   */
  @Get('milestones/:runId')
  @HttpCode(HttpStatus.OK)
  async getMilestones(
    @Req() req: Request & { user: { id: string } },
    @Param('runId') runId: string,
  ): Promise<MilestoneResponseDto[]> {
    return this.milestonesService.getMilestones(req.user.id, runId);
  }
}
