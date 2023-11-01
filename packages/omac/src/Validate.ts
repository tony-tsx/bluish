import { getMetadataArgsStorage } from '@bluish/core';
import 'reflect-metadata';

export interface OmacValidateMetadataArgs {
  target: Function;
  propertyKey: string | symbol;
  parameterIndex: number;
  get: () => new () => object;
}

export function Omac(schema?: () => new () => object) {
  return (target: object, propertyKey: string | symbol, parameterIndex: number) => {
    getMetadataArgsStorage().args('@omac:validations', {
      target: target.constructor,
      parameterIndex,
      propertyKey,
      get: schema
        ? schema
        : () => Reflect.getMetadata('design:paramtypes', target, propertyKey)[parameterIndex] as new () => object,
    });
  };
}

declare global {
  namespace Bluish {
    interface MetadataArgsStorage {
      readonly '@omac:validations': OmacValidateMetadataArgs[];
    }
  }
}
