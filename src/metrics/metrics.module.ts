import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { metricProviders } from './metrics.providers';

/**
 * Module for Prometheus metrics integration
 * Configures metrics collection and exposes endpoints
 */
@Module({
  imports: [
    PrometheusModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';

        return {
          path: '/metrics',
          defaultMetrics: {
            enabled: true,
            // Collect default metrics every 5 seconds
            config: {
              prefix: 'speedcode_',
            },
            interval: 5000, // Collect metrics every 5 seconds
          },
          defaultLabels: {
            app: 'speedcode-backend',
            env: isProduction ? 'production' : 'development',
          },
        };
      },
    }),
  ],
  controllers: [MetricsController],
  providers: [MetricsService, ...metricProviders],
  exports: [MetricsService],
})
export class MetricsModule {}
