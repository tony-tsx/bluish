import { HandlerExecuteErrorEvent, HandlerExecuteParameterEvent, Middleware } from '@bluish/core';
import { ValidationError, analyze } from 'omac';

export { IsSchema } from './IsSchema.js';

export class OnValidationErrorMiddleware extends Middleware {
  constructor(
    public readonly handle: (error: ValidationError, event: HandlerExecuteErrorEvent) => void | Promise<void>,
  ) {
    super();
  }

  public async onParameter(event: HandlerExecuteParameterEvent): Promise<void> {
    if (!event.context.runner.app.schemas) return;

    const types = Reflect.getMetadata(
      'design:paramtypes',
      event.context.runner.handler.target.prototype,
      event.context.runner.handler.propertyKey,
    );

    const type = types[event.parameterIndex];

    if (!event.context.runner.app.schemas.has(type)) return;

    const result = await analyze(event.value as object, type);

    if (result.status === 'fulfilled') event.value = result.value;
    else throw result.reason;
  }

  public onError(event: HandlerExecuteErrorEvent): void | Promise<void> {
    if (!(event.error instanceof ValidationError)) return;

    return this.handle(event.error, event);
  }
}
