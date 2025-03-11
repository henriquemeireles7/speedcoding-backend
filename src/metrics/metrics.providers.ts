import { Provider } from '@nestjs/common';
import {
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

/**
 * Providers for custom Prometheus metrics
 */
export const metricProviders: Provider[] = [
  // API metrics
  makeHistogramProvider({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  }),

  makeCounterProvider({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status_code'],
  }),

  makeHistogramProvider({
    name: 'http_request_size_bytes',
    help: 'Size of HTTP requests in bytes',
    labelNames: ['method', 'path'],
    buckets: [100, 1000, 10000, 100000, 1000000],
  }),

  makeHistogramProvider({
    name: 'http_response_size_bytes',
    help: 'Size of HTTP responses in bytes',
    labelNames: ['method', 'path'],
    buckets: [100, 1000, 10000, 100000, 1000000],
  }),

  // Cache metrics
  makeCounterProvider({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache_type', 'key'],
  }),

  makeCounterProvider({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache_type', 'key'],
  }),

  makeHistogramProvider({
    name: 'cache_operation_duration_seconds',
    help: 'Duration of cache operations in seconds',
    labelNames: ['operation'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
  }),

  // Rate limiting metrics
  makeCounterProvider({
    name: 'rate_limit_exceeded_total',
    help: 'Total number of rate limit exceeded events',
    labelNames: ['path', 'method', 'ip'],
  }),

  // Business metrics
  makeHistogramProvider({
    name: 'run_duration_seconds',
    help: 'Duration of speedruns in seconds',
    labelNames: ['vibe_id', 'tech_stack'],
    buckets: [60, 300, 600, 1800, 3600, 7200, 14400],
  }),

  makeCounterProvider({
    name: 'milestone_completion_total',
    help: 'Total number of milestone completions',
    labelNames: ['vibe_id', 'milestone_index'],
  }),

  makeGaugeProvider({
    name: 'active_runs_gauge',
    help: 'Number of currently active runs',
    labelNames: ['vibe_id'],
  }),
];
