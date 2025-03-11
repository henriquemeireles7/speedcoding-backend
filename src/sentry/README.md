# Sentry Module

This module provides Sentry integration for error tracking and performance monitoring in the SpeedCode backend.

## Features

- **Error Tracking**: Automatically captures and reports errors to Sentry
- **Performance Monitoring**: Tracks transaction performance and identifies bottlenecks
- **User Context**: Associates errors with user information for better debugging
- **Breadcrumbs**: Records application events leading up to errors
- **Custom Tags**: Adds metadata to errors for better filtering and analysis
- **Sanitization**: Automatically redacts sensitive information from error reports

## Configuration

The Sentry module requires the following environment variables:

```
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NODE_ENV=development|production
APP_VERSION=1.0.0
```

## Usage

### Capturing Exceptions

Inject the `SentryService` into your service or controller:

```typescript
import { Injectable } from '@nestjs/common';
import { SentryService } from '../sentry/sentry.service';

@Injectable()
export class UserService {
  constructor(private readonly sentryService: SentryService) {}

  async findUser(id: string): Promise<User> {
    try {
      // Your business logic...
    } catch (error) {
      // Capture the exception with additional context
      this.sentryService.captureException(error, (scope) => {
        scope.setExtra('userId', id);
        return scope;
      });

      throw error; // Re-throw the error to be handled by exception filters
    }
  }
}
```

### Adding User Context

Set user information to associate errors with specific users:

```typescript
// In your auth guard or service
this.sentryService.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});
```

### Performance Monitoring

Track performance of operations:

```typescript
async processPayment(paymentId: string): Promise<void> {
  // Start a transaction
  const transaction = this.sentryService.startTransaction({
    name: 'processPayment',
    op: 'payment',
  });

  try {
    // Start a span for a specific operation
    const validateSpan = this.sentryService.startSpan({
      name: 'validatePayment',
      op: 'validation',
    }, transaction);

    // Validation logic...

    validateSpan.finish();

    // Another span for processing
    const processSpan = this.sentryService.startSpan({
      name: 'executePayment',
      op: 'processing',
    }, transaction);

    // Processing logic...

    processSpan.finish();

    // Finish the transaction
    transaction.finish();
  } catch (error) {
    // Set transaction status to error
    transaction.setStatus('error');
    transaction.finish();

    // Capture the exception
    this.sentryService.captureException(error);
    throw error;
  }
}
```

### Adding Breadcrumbs

Record events leading up to an error:

```typescript
// Record an important event
this.sentryService.addBreadcrumb({
  category: 'auth',
  message: 'User login attempt',
  level: 'info',
  data: {
    username: username,
    success: true,
  },
});
```

## Architecture

The Sentry module consists of:

- **SentryModule**: Global module that provides Sentry services
- **SentryService**: Service for initializing Sentry and capturing errors
- **SentryInterceptor**: Interceptor that adds request context to errors
- **SentryExceptionFilter**: Exception filter that captures unhandled exceptions

## Sentry Dashboard

The Sentry dashboard provides:

- Real-time error tracking and notifications
- Performance monitoring and transaction analysis
- User impact analysis
- Release tracking
- Issue assignment and resolution workflow

## Best Practices

1. **Capture Meaningful Errors**: Only capture errors that are actionable and provide context
2. **Add User Context**: Always associate errors with user information when available
3. **Use Tags for Filtering**: Add tags to errors for better filtering and analysis
4. **Add Breadcrumbs**: Record important events leading up to errors
5. **Sanitize Sensitive Data**: Never send sensitive information to Sentry
6. **Monitor Performance**: Use transactions and spans to identify bottlenecks
7. **Set Up Alerts**: Configure Sentry alerts for critical errors
