import { Middleware, getMetadataArgsStorage } from '@bluish/core';

import { Request } from '../models/Request.js';

export function DefineParam(paramName: string, loader: (value: string, request: Request) => unknown) {
  return (target: Function) => {
    getMetadataArgsStorage().args('middlewares', {
      target,
      instance: Middleware.onHandler(handler => {
        handler['@http:params:definitions'] ??= new Map();
        handler['@http:params:definitions'].set(paramName, loader);
      }),
    });
  };
}

declare global {
  namespace Bluish {
    interface HandlerMetadata {
      '@http:params:definitions'?: Map<string, (value: string, request: Request) => unknown | Promise<unknown>>;
    }
  }
}
