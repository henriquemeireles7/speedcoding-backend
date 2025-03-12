import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global module for Prisma database service
 * This makes the PrismaService available throughout the application
 * without needing to import PrismaModule in each feature module
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
