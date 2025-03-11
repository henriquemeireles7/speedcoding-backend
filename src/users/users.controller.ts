import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { CacheEvict } from '../cache/cache.decorators';

/**
 * Controller for managing user profiles
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Get current user profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  async getProfile(@Request() req): Promise<UserResponseDto> {
    const user = await this.usersService.findById(req.user.sub);
    return this.usersService.mapToDto(user);
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    return this.usersService.mapToDto(user);
  }

  /**
   * Update user profile
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @CacheEvict('users')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ): Promise<UserResponseDto> {
    // Only allow users to update their own profile
    if (req.user.sub !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.usersService.update(id, updateUserDto);
    return this.usersService.mapToDto(user);
  }

  /**
   * Upload avatar image
   */
  @Post(':id/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload avatar image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseInterceptors(FileInterceptor('file'))
  @CacheEvict('users')
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<UserResponseDto> {
    // Only allow users to update their own avatar
    if (req.user.sub !== id) {
      throw new ForbiddenException('You can only update your own avatar');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Get current user to check if they already have an avatar
    const user = await this.usersService.findById(id);

    // Delete old avatar if it exists
    if (user.avatarUrl) {
      await this.fileUploadService.deleteAvatar(user.avatarUrl);
    }

    // Upload new avatar
    const avatarUrl = await this.fileUploadService.uploadAvatar(file, id);

    // Update user with new avatar URL
    const updatedUser = await this.usersService.update(id, { avatarUrl });

    return this.usersService.mapToDto(updatedUser);
  }

  /**
   * Delete user
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @CacheEvict('users')
  async remove(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    // Only allow users to delete their own account
    if (req.user.sub !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }

    // Get user to check if they have an avatar
    const user = await this.usersService.findById(id);

    // Delete avatar if it exists
    if (user.avatarUrl) {
      await this.fileUploadService.deleteAvatar(user.avatarUrl);
    }

    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  /**
   * Get user statistics
   */
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserStats(@Param('id') id: string): Promise<any> {
    // Check if user exists
    await this.usersService.findById(id);

    return this.usersService.getUserStats(id);
  }

  /**
   * Get user runs
   */
  @Get(':id/runs')
  @ApiOperation({ summary: 'Get user runs' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of runs to return',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Number of runs to skip',
    required: false,
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'User runs retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserRuns(
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<any[]> {
    // Check if user exists
    await this.usersService.findById(id);

    return this.usersService.getUserRuns(id, limit, offset);
  }
}
