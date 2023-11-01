import { Context, HandlerMetadata, Runner } from '@bluish/core';
import { FunctionOutput, app } from '@azure/functions';

import { AzureFunctionAppInput } from '../AzureFunctionAppInput.js';

import '@bluish/cron';

export class AzureFunctionAppTimerContext extends Context {}

export class AzureFunctionAppTimerInput extends AzureFunctionAppInput {
  public test(handler: HandlerMetadata): boolean {
    return handler.is('cron');
  }

  public register(runner: Runner, outputs: FunctionOutput[]): void {
    const name = `TIMER_${this.getHandlerName(runner.handler)}_${this.getHandlerPropertyName(runner.handler)}`;

    app.timer(name, {
      schedule: runner.handler.args['@cron:pattern'],
      handler: runner.toFunction(),
      extraOutputs: outputs,
    });
  }

  public async toContext(): Promise<AzureFunctionAppTimerContext> {
    return new AzureFunctionAppTimerContext();
  }

  public toReturn() {
    return undefined;
  }
}
