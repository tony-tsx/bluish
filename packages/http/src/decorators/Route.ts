import { Handler } from '@bluish/core';

import { Path } from './Path.js';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export function Route(method: HttpMethod | [HttpMethod, ...HttpMethod[]], path: string | string[] = []) {
  const methods = Array.isArray(method) ? method : ([method] as const);

  return (target: Object, propertyKey: string | symbol) => {
    Handler('http', { '@http:methods': methods })(target, propertyKey);

    Path(path)(target, propertyKey);
  };
}

declare global {
  namespace Bluish {
    interface HandlerMetadataArgs {
      '@http:methods': HttpMethod[];
    }
  }
}
