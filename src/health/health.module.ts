import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Registry } from 'prom-client';

/**
 * Health module for monitoring application status
 * Provides endpoints to check the health of various components
 */
@Module({
  imports: [
    // Terminus module for health checks
    TerminusModule,
    // HTTP module for external service health checks
    HttpModule,
    // Prometheus module for metrics
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  controllers: [HealthController],
  providers: [
    PrismaService,
    // Provide the Prometheus registry as a custom provider
    {
      provide: 'PROM_METRIC_PROM_CLIENT_DEFAULT_REGISTRY',
      useFactory: () => new Registry(),
    },
  ],
})
export class HealthModule {}
