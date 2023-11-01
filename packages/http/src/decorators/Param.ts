import { Middleware, Parameter, getMetadataArgsStorage } from '@bluish/core';

import { Request } from '../models/Request.js';

export function Param(paramName: string, loader: (value: string, request: Request) => unknown): ClassDecorator;
export function Param(paramName: string): ParameterDecorator;
export function Param(paramName: string, loader?: (value: string, request: Request) => unknown) {
  if (!loader)
    return Parameter(request => {
      if (!(request instanceof Request)) return null;

      return request.params[paramName];
    });

  return (target: Function) => {
    getMetadataArgsStorage()
      .args('@http.params', { target, paramName, loader: loader! })
      .args('middlewares', {
        target,
        instance: Middleware.onBefore(async function ParamLoaderMiddleware(event) {
          if (!(event.context instanceof Request)) return;

          if (!event.context.params[paramName]) return;

          event.context.params[`__${paramName}`] = event.context.params[paramName];
          event.context.params[paramName] = await loader(event.context.params[paramName] as string, event.context);
        }),
      });
  };
}
