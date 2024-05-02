import { getMetadataArgsStorage } from '@bluish/core';

export function ShieldScope(scope: string) {
  return (target: Function | object, propertyKey: string | symbol) => {
    getMetadataArgsStorage().args('@shield:scopes', { target, propertyKey, scope });
  };
}
