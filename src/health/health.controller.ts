import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
  HealthCheckResult,
  HealthIndicatorResult,
} from '@nestjs/terminus';

/**
 * Health check controller for monitoring application status
 * Provides endpoints to check the health of various components
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  /**
   * Check the overall health of the application
   * @returns Health check result for all components
   */
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Application is not healthy' })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Check database connection
      async () =>
        this.prismaHealth.pingCheck(
          'database',
          this.prisma,
        ) as Promise<HealthIndicatorResult>,
    ]);
  }
}
