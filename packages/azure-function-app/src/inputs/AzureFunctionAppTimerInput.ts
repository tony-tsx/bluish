import { Context, ActionMetadata, Runner } from '@bluish/core';
import { FunctionOutput, app } from '@azure/functions';

import { AzureFunctionAppInput } from '../models/AzureFunctionAppInput.js';

import '@bluish/timer';

export class AzureFunctionAppTimerContext extends Context {}

export class AzureFunctionAppTimerInput extends AzureFunctionAppInput {
  public test(action: ActionMetadata): boolean {
    return action.is('timer');
  }

  public register(runner: Runner<'timer'>, outputs: FunctionOutput[]): void {
    const name = `TIMER_${this.getControllerName(runner.action)}_${this.getActionPropertyName(runner.action)}`;

    app.timer(name, {
      schedule: runner.action.args['@timer:pattern'],
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
