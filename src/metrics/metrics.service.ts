import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';

/**
 * Service for managing Prometheus metrics
 * Provides methods to record various metrics throughout the application
 */
@Injectable()
export class MetricsService implements OnModuleInit {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,

    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter<string>,

    @InjectMetric('http_request_size_bytes')
    private readonly httpRequestSize: Histogram<string>,

    @InjectMetric('http_response_size_bytes')
    private readonly httpResponseSize: Histogram<string>,

    @InjectMetric('cache_hits_total')
    private readonly cacheHitsTotal: Counter<string>,

    @InjectMetric('cache_misses_total')
    private readonly cacheMissesTotal: Counter<string>,

    @InjectMetric('cache_operation_duration_seconds')
    private readonly cacheOperationDuration: Histogram<string>,

    @InjectMetric('rate_limit_exceeded_total')
    private readonly rateLimitExceeded: Counter<string>,

    @InjectMetric('run_duration_seconds')
    private readonly runDuration: Histogram<string>,

    @InjectMetric('milestone_completion_total')
    private readonly milestoneCompletion: Counter<string>,

    @InjectMetric('active_runs_gauge')
    private readonly activeRuns: Gauge<string>,
  ) {}

  /**
   * Initialize metrics on module initialization
   */
  onModuleInit() {
    // Initialize active runs gauge to 0
    this.activeRuns.set(0);
  }

  /**
   * Record metrics for an HTTP request
   */
  recordHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    requestSize?: number,
    responseSize?: number,
  ): void {
    const labels = { method, path, status_code: statusCode.toString() };

    // Record request duration
    this.httpRequestDuration.observe(labels, duration);

    // Increment request counter
    this.httpRequestsTotal.inc(labels);

    // Record request and response sizes if provided
    if (requestSize !== undefined) {
      this.httpRequestSize.observe({ method, path }, requestSize);
    }

    if (responseSize !== undefined) {
      this.httpResponseSize.observe({ method, path }, responseSize);
    }
  }

  /**
   * Record a cache hit
   */
  recordCacheHit(cacheType: string, key: string): void {
    this.cacheHitsTotal.inc({ cache_type: cacheType, key });
  }

  /**
   * Record a cache miss
   */
  recordCacheMiss(cacheType: string, key: string): void {
    this.cacheMissesTotal.inc({ cache_type: cacheType, key });
  }

  /**
   * Record duration of a cache operation
   */
  recordCacheOperationDuration(operation: string, duration: number): void {
    this.cacheOperationDuration.observe({ operation }, duration);
  }

  /**
   * Record a rate limit exceeded event
   */
  recordRateLimitExceeded(path: string, method: string, ip: string): void {
    this.rateLimitExceeded.inc({ path, method, ip });
  }

  /**
   * Record the duration of a run
   */
  recordRunDuration(
    vibeId: string,
    techStack: string,
    durationSeconds: number,
  ): void {
    this.runDuration.observe(
      { vibe_id: vibeId, tech_stack: techStack },
      durationSeconds,
    );
  }

  /**
   * Record a milestone completion
   */
  recordMilestoneCompletion(vibeId: string, milestoneIndex: number): void {
    this.milestoneCompletion.inc({
      vibe_id: vibeId,
      milestone_index: milestoneIndex.toString(),
    });
  }

  /**
   * Increment the active runs gauge
   */
  incrementActiveRuns(vibeId: string): void {
    this.activeRuns.inc({ vibe_id: vibeId });
  }

  /**
   * Decrement the active runs gauge
   */
  decrementActiveRuns(vibeId: string): void {
    this.activeRuns.dec({ vibe_id: vibeId });
  }
}
