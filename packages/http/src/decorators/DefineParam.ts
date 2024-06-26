import { Middleware, Use } from '@bluish/core';

import { Request } from '../models/Request.js';

export function DefineParam(paramName: string, loader: (value: string, request: Request) => unknown) {
  return (target: Function) => {
    Use(
      Middleware.onAction(action => {
        action['@http:params:definitions'] ??= new Map();
        action['@http:params:definitions'].set(paramName, loader);
      }),
    )(target);
  };
}

declare global {
  namespace Bluish {
    interface ActionMetadata {
      '@http:params:definitions'?: Map<string, (value: string, request: Request) => unknown | Promise<unknown>>;
    }
  }
}
