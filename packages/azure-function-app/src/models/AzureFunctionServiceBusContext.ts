import { InvocationContext } from '@azure/functions';
import { Context } from '@bluish/core';

export class AzureFunctionServiceBusContext extends Context {
  constructor(
    public readonly queueItem: unknown,
    public readonly invocationContext: InvocationContext,
  ) {
    super();
  }
}
