import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for metrics endpoints
 * The /metrics endpoint is automatically exposed by the PrometheusModule
 */
@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  /**
   * Health check endpoint for metrics
   * @returns Simple health status
   */
  @Get('health')
  @ApiOperation({ summary: 'Check metrics health' })
  @ApiResponse({ status: 200, description: 'Metrics service is healthy' })
  checkHealth() {
    return { status: 'ok', service: 'metrics' };
  }
}
