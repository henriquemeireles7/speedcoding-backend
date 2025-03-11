import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { FileUploadService } from './file-upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';

/**
 * Module for managing user profiles
 */
@Module({
  imports: [
    PrismaModule,
    CacheModule,
    ConfigModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, FileUploadService],
  exports: [UsersService],
})
export class UsersModule {}
