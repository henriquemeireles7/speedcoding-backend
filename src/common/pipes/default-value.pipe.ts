import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class DefaultValuePipe<T = any> implements PipeTransform<T, T> {
  constructor(private readonly defaultValue: T) {}

  transform(value: T): T {
    if (value === null || value === undefined) {
      return this.defaultValue;
    }
    return value;
  }
}
