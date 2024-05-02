import { ActionArgumentEvent, ActionErrorEvent, Middleware } from '@bluish/core';
import { ValidationError, analyze } from 'ornate-guard';

import { getReflectMetadataParamTypeFromAction } from './getReflectMetadataParamTypesFromAction.js';
import { IsGuard } from './IsGuard.js';

export class OnCatchValidationErrorMiddleware extends Middleware {
  constructor(
    private readonly onCatchValidationError: (error: ValidationError, event: ActionErrorEvent) => void | Promise<void>,
  ) {
    super();
  }

  public async onArgument(event: ActionArgumentEvent): Promise<void> {
    if (!event.context.runner.application.schemas) return;

    const type = getReflectMetadataParamTypeFromAction(event.context.runner.action, event.parameterIndex);

    if (!IsGuard.storage.has(type)) return;

    const result = await analyze(event.value as object, type);

    if (result.status === 'fulfilled') event.value = result.value;
    else throw result.reason;
  }

  public onCatch(event: ActionErrorEvent): void | Promise<void> {
    if (!(event.error instanceof ValidationError)) return;
    return this.onCatchValidationError(event.error, event);
  }
}
