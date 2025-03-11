# Metrics Module

This module provides Prometheus metrics integration for the SpeedCode backend. It collects and exposes various metrics about the application's performance and business operations.

## Features

- **HTTP Metrics**: Tracks request duration, count, size, and response size
- **Cache Metrics**: Monitors cache hits, misses, and operation durations
- **Rate Limiting Metrics**: Records rate limit exceeded events
- **Business Metrics**: Tracks run durations, milestone completions, and active runs

## Endpoints

- `/metrics`: Exposes all Prometheus metrics
- `/metrics/health`: Simple health check for the metrics service

## Usage

### Automatic HTTP Metrics

HTTP metrics are automatically collected via the `MetricsInterceptor`, which is registered globally in the `AppModule`.

### Recording Custom Metrics

Inject the `MetricsService` into your service or controller:

```typescript
import { Injectable } from '@nestjs/common';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class RunsService {
  constructor(private readonly metricsService: MetricsService) {}

  async completeRun(
    runId: string,
    vibeId: string,
    techStack: string,
  ): Promise<void> {
    // Your business logic...

    // Record run duration
    const durationSeconds = calculateDuration(); // Your calculation logic
    this.metricsService.recordRunDuration(vibeId, techStack, durationSeconds);
  }
}
```

### Available Metrics

#### HTTP Metrics

- `http_request_duration_seconds`: Histogram of HTTP request durations
- `http_requests_total`: Counter of HTTP requests
- `http_request_size_bytes`: Histogram of HTTP request sizes
- `http_response_size_bytes`: Histogram of HTTP response sizes

#### Cache Metrics

- `cache_hits_total`: Counter of cache hits
- `cache_misses_total`: Counter of cache misses
- `cache_operation_duration_seconds`: Histogram of cache operation durations

#### Rate Limiting Metrics

- `rate_limit_exceeded_total`: Counter of rate limit exceeded events

#### Business Metrics

- `run_duration_seconds`: Histogram of run durations
- `milestone_completion_total`: Counter of milestone completions
- `active_runs_gauge`: Gauge of currently active runs

## Grafana Integration

These metrics can be visualized in Grafana dashboards. Example dashboard JSON configurations are available in the `dashboards` directory.

## Configuration

The metrics module is configured in `src/metrics/metrics.module.ts`. You can adjust the collection interval, prefix, and default labels there.

## Health Checks

The metrics health check is integrated with the application's health check system. You can check the status of the Prometheus metrics collector at `/health`.
