import { Middleware, HandlerExecuteErrorEvent } from '@bluish/core';
import { Request } from '@bluish/http';
import { isHttpError } from 'http-errors';

export class HttpErrorMiddleware extends Middleware {
  public onError(event: HandlerExecuteErrorEvent): void {
    if (!(event.context instanceof Request)) return;

    if (!isHttpError(event.error)) return;

    event.prevent({
      status: event.error.status,
      body: {
        message: event.error.message,
        errors: event.error.errors,
      },
    });
  }
}
