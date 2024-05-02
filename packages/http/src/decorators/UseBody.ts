import { Argument } from '@bluish/core';

import { Request } from '../models/Request.js';
import { HttpBodyEvent } from '../events/HttpBodyEvent.js';

export function UseBody(target: Object | Function, propertyKey: string | symbol, parameterIndex: number) {
  return Argument(async context => {
    if (!(context instanceof Request)) return null;

    const event = new HttpBodyEvent(context, parameterIndex, context.body);

    for (const middleware of context.runner.middlewares) await middleware.onHttpBody?.(event);

    return event.value;
  })(target, propertyKey, parameterIndex);
}
declare global {
  namespace Bluish {
    interface Middleware {
      onHttpBody?(event: HttpBodyEvent): void | Promise<void>;
    }
  }
}
