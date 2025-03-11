import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

/**
 * Service for managing Redis client connections
 * Provides a Redis client for both caching and rate limiting
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType | null = null;
  private isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
  }

  /**
   * Initialize Redis client on module init
   */
  async onModuleInit(): Promise<void> {
    if (this.isProduction) {
      await this.connectToRedis();
    } else {
      this.logger.log('Redis client not initialized in development mode');
    }
  }

  /**
   * Disconnect Redis client on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis client disconnected');
    }
  }

  /**
   * Get Redis client
   * @returns Redis client or null if not connected
   */
  getClient(): RedisClientType | null {
    return this.client;
  }

  /**
   * Check if Redis client is available
   * @returns Whether Redis client is available
   */
  isClientAvailable(): boolean {
    return this.client !== null && this.client.isOpen;
  }

  /**
   * Connect to Redis
   * @returns Redis client
   */
  async connectToRedis(): Promise<RedisClientType> {
    if (this.client && this.client.isOpen) {
      return this.client;
    }

    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error('REDIS_URL is required for Redis connection');
    }

    try {
      this.client = createClient({
        url: redisUrl,
      });

      this.client.on('error', (err) => {
        this.logger.error(`Redis client error: ${err.message}`, err.stack);
      });

      this.client.on('connect', () => {
        this.logger.log('Redis client connected');
      });

      this.client.on('reconnecting', () => {
        this.logger.log('Redis client reconnecting');
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      this.logger.error(
        `Failed to connect to Redis: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
