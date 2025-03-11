import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * Used to protect routes that require authentication
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
