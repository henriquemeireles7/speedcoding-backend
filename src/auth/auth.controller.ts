import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponseDto, LoginDto } from './dto';

/**
 * Authentication Controller
 * Handles authentication-related endpoints
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Login endpoint
   * @param loginDto Login credentials
   * @returns JWT token
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
}
