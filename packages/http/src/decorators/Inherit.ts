import { getMetadataArgsStorage } from '@bluish/core';

export function Inherit<T>(get: () => new () => T) {
  return (target: Function | Object, propertyKey?: string | symbol) => {
    getMetadataArgsStorage().args('@http:inherit', {
      target: typeof target === 'function' ? target : target.constructor,
      propertyKey,
      get,
    });
  };
}
