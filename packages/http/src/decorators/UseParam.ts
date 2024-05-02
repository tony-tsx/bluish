import { Argument } from '@bluish/core';

import { Request } from '../models/Request.js';
import { HttpParamEvent } from '../events/HttpParamEvent.js';

export function UseParam(paramName: string) {
  return (target: Object, propertyName: string, parameterIndex: number) => {
    Argument(async context => {
      if (!(context instanceof Request)) return null;

      const definitions = context.runner.action['@http:params:definitions'];

      let value = context.params[paramName];

      if (definitions?.has(paramName)) value = await definitions!.get(paramName)!(value as string, context);

      const event = new HttpParamEvent(context, paramName, parameterIndex, value);

      for (const middleware of context.runner.middlewares) await middleware.onHttpParam?.(event);

      return event.value;
    })(target, propertyName, parameterIndex);
  };
}

declare global {
  namespace Bluish {
    interface Middleware {
      onHttpParam?(event: HttpParamEvent): void | Promise<void>;
    }
  }
}
