import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { validate, ValidatorOptions } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ClassTransformOptions } from 'class-transformer';

interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  transformOptions?: ClassTransformOptions;
}

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  private readonly options: ValidationPipeOptions;

  constructor(options: ValidationPipeOptions = {}) {
    this.options = {
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      ...options,
    };
  }

  async transform<T>(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<T> {
    if (!metatype || !this.toValidate(metatype)) {
      return value as T;
    }

    const object = plainToInstance(
      metatype as Type<T>,
      value,
      this.options.transformOptions,
    );

    const errors = await validate(object as object, this.options);

    if (errors.length > 0) {
      const messages = errors.map((err) => {
        return {
          property: err.property,
          constraints: err.constraints,
        };
      });

      throw new BadRequestException(
        `Validation failed: ${JSON.stringify(messages)}`,
      );
    }

    return object;
  }

  private toValidate(metatype: Type<unknown>): boolean {
    const types: Type<unknown>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
