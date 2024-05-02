import { getMetadataArgsStorage } from '@bluish/core';

export function ShieldProtect() {
  return (target: Function | object, propertyKey: string | symbol) => {
    getMetadataArgsStorage().args('@shield:protects', { target, propertyKey });
  };
}
