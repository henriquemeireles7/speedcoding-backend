# Authentication Module

The Authentication Module provides a comprehensive solution for user authentication in the SpeedCode backend. It includes JWT-based authentication, social login via Google and GitHub, and email verification.

## Features

- JWT-based authentication
- Social login (Google, GitHub)
- Email verification
- Password reset
- Refresh token management
- Role-based access control

## Key Components

### Guards

- **JwtAuthGuard**: Protects routes requiring authentication
- **EmailVerifiedGuard**: Ensures the user's email is verified before accessing certain routes

### Decorators

- **@Public()**: Marks routes as public (no authentication required)
- **@Roles()**: Specifies which roles can access a route

### Strategies

- **JwtStrategy**: Validates JWT tokens from Authorization header
- **GoogleStrategy**: Handles Google OAuth authentication
- **GitHubStrategy**: Handles GitHub OAuth authentication

### Services

- **AuthService**: Main service coordinating authentication operations
- **TokenService**: Manages JWT token generation and validation
- **CredentialsService**: Handles password hashing and verification
- **SocialAuthService**: Processes social login authentications
- **LoginService**: Handles user login
- **RegisterService**: Manages user registration

### Repositories

- **UserRepository**: Interacts with the user table in the database
- **RefreshTokenRepository**: Manages refresh tokens in the database

## Usage Examples

### Protecting a Route

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  @Get()
  getProfile() {
    return { message: 'This route is protected' };
  }
}
```

### Public Route

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  health() {
    return { status: 'ok' };
  }
}
```

### Getting the Current User

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  @Get()
  getProfile(@Request() req) {
    // The user object is attached to the request
    return req.user;
  }
}
```

## Configuration

Authentication settings are configured through environment variables:

- `JWT_SECRET`: Secret key for signing JWT tokens
- `JWT_EXPIRES_IN`: Access token expiration (default: '15m')
- `REFRESH_TOKEN_EXPIRES_IN`: Refresh token expiration (default: '7d')
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_CALLBACK_URL`: Google OAuth callback URL
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret
- `GITHUB_CALLBACK_URL`: GitHub OAuth callback URL

## Security Considerations

- Access tokens have a short lifespan (15 minutes by default)
- Refresh tokens are stored securely and can be revoked
- Passwords are hashed using bcrypt
- CSRF protection is implemented
- Rate limiting prevents brute force attacks

## Architecture

The authentication module follows a modular design with clear separation of concerns:

1. **Controllers** handle HTTP requests and responses
2. **Guards** protect routes and handle authorization
3. **Strategies** implement authentication methods
4. **Services** contain business logic
5. **Repositories** handle data access
6. **DTOs** validate input data

## Flow Diagrams

### JWT Authentication Flow

```
┌─────────────┐      ┌────────────┐      ┌──────────────┐
│             │      │            │      │              │
│   Client    │──────▶   Guard    │──────▶  JwtStrategy │
│             │      │            │      │              │
└─────────────┘      └────────────┘      └──────────────┘
                                                 │
                                                 ▼
┌─────────────┐      ┌────────────┐      ┌──────────────┐
│             │      │            │      │              │
│  Controller ◀──────┤ User Data  │◀─────┤  Repository  │
│             │      │            │      │              │
└─────────────┘      └────────────┘      └──────────────┘
```

### Social Authentication Flow

```
┌─────────────┐      ┌────────────┐      ┌──────────────┐
│             │      │ OAuth      │      │ Social       │
│   Client    │──────▶ Provider   │──────▶ Strategy     │
│             │      │            │      │              │
└─────────────┘      └────────────┘      └──────────────┘
                                                 │
                                                 ▼
┌─────────────┐      ┌────────────┐      ┌──────────────┐
│             │      │            │      │              │
│  Response   ◀──────┤ Token      │◀─────┤  AuthService │
│             │      │ Generation │      │              │
└─────────────┘      └────────────┘      └──────────────┘
```

## Future Improvements

- Add multi-factor authentication
- Implement OAuth2 authorization server capabilities
- Add more social login providers
- Enhance session management
