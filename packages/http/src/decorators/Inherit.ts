import { getMetadataArgsStorage } from '@bluish/core';

export function Inherit<T>(get: () => new () => T) {
  return (target: Function) => {
    getMetadataArgsStorage().args('@http:inherit', { target, get });
  };
}
