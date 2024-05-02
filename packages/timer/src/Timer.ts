import { Action } from '@bluish/core';

export function Timer(pattern: string) {
  return (target: object, propertyKey: string | symbol) => {
    Action('timer', { '@timer:pattern': pattern })(target, propertyKey);
  };
}

declare global {
  namespace Bluish {
    interface ActionMetadataArgMapByType {
      timer: {
        '@timer:pattern': string;
      };
    }
  }
}
