import { Handler } from '@bluish/core';

export function Cron(pattern: string) {
  return (target: object, propertyKey: string | symbol) => {
    Handler('cron', { '@cron:pattern': pattern })(target, propertyKey);
  };
}

declare global {
  namespace Bluish {
    interface HandlerMetadataArgs {
      '@cron:pattern': string;
    }
  }
}
