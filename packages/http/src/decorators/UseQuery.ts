import { Argument } from '@bluish/core';

import { Request } from '../models/Request.js';
import { HttpQueryEvent } from '../events/HttpQueryEvent.js';

export function UseQuery(target: Object | Function, propertyKey: string | symbol, parameterIndex: number) {
  return Argument(async context => {
    if (!(context instanceof Request)) return null;

    const event = new HttpQueryEvent(context, parameterIndex, context.query);

    for (const middleware of context.runner.middlewares) await middleware.onHttpQuery?.(event);

    return event.value;
  })(target, propertyKey, parameterIndex);
}

declare global {
  namespace Bluish {
    interface Middleware {
      onHttpQuery?(event: HttpQueryEvent): void | Promise<void>;
    }
  }
}
