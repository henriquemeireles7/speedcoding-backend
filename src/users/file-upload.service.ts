import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for handling file uploads
 */
@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly uploadDir: string;
  private readonly avatarDir: string;
  private readonly maxFileSize: number = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes: string[] = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', 'uploads');
    this.avatarDir = path.join(this.uploadDir, 'avatars');

    // Create upload directories if they don't exist
    this.ensureDirectoryExists(this.uploadDir);
    this.ensureDirectoryExists(this.avatarDir);
  }

  /**
   * Upload and process an avatar image
   * @param file File to upload
   * @param userId User ID
   * @returns URL to the uploaded avatar
   */
  async uploadAvatar(
    file: Express.Multer.File,
    userId: string,
  ): Promise<string> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const filename = `${userId}-${uuidv4()}${path.extname(file.originalname)}`;
    const filepath = path.join(this.avatarDir, filename);

    try {
      // Process image with sharp (resize, optimize)
      await this.processImage(file.buffer, filepath);

      // Return relative URL to the avatar
      return `/uploads/avatars/${filename}`;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Failed to process image: ${errorMessage}`);
      throw new BadRequestException('Failed to process image');
    }
  }

  /**
   * Delete an avatar file
   * @param avatarUrl URL of the avatar to delete
   */
  async deleteAvatar(avatarUrl: string): Promise<void> {
    if (!avatarUrl) return;

    // Extract filename from URL
    const filename = path.basename(avatarUrl);
    const filepath = path.join(this.avatarDir, filename);

    // Check if file exists
    if (fs.existsSync(filepath)) {
      try {
        await fsPromises.unlink(filepath);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(`Failed to delete avatar file: ${errorMessage}`);
      }
    }
  }

  /**
   * Process an image with sharp
   * @param buffer Image buffer
   * @param outputPath Output file path
   */
  private async processImage(
    buffer: Buffer,
    outputPath: string,
  ): Promise<void> {
    await sharp(buffer)
      .resize(300, 300, { fit: 'cover' }) // Resize to 300x300
      .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
      .toFile(outputPath);
  }

  /**
   * Validate a file
   * @param file File to validate
   */
  private validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds the limit of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Check file type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  /**
   * Ensure a directory exists
   * @param dir Directory path
   */
  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
