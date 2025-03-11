import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response as ExpressResponse } from 'express';

/**
 * Standard response format for successful responses
 */
export interface Response<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * Transform interceptor
 * Provides consistent response format across the application
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<ExpressResponse>();

    return next.handle().pipe(
      map((data: T) => ({
        data,
        statusCode: response.statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      })),
    );
  }
}
