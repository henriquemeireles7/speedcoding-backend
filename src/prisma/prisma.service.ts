import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service for handling Prisma database connections
 * Implements lifecycle hooks to manage connection state
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Connect to the database when the module initializes
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Disconnect from the database when the module is destroyed
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
