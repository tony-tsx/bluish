import { Context, Driver, ActionMetadata, Runner, getMetadataArgsStorage, tools } from '@bluish/core';
import { InvocationContext } from '@azure/functions';

import { AzureFunctionAppInput } from './AzureFunctionAppInput.js';

export interface AzureFunctionAppDriverConfiguration {
  inputs: AzureFunctionAppInput[];
}

export class AzureFunctionAppDriver extends Driver {
  protected readonly inputs: readonly AzureFunctionAppInput[];

  constructor(configuration: AzureFunctionAppDriverConfiguration) {
    super();

    this.inputs = configuration.inputs;
  }

  protected findAzureFunctionAppInput(action: ActionMetadata) {
    return this.inputs.find(input => input.test(action));
  }

  public async toContext(runner: Runner, input: any, invocationContext: InvocationContext): Promise<Context> {
    const azureFunctionAppInput = this.findAzureFunctionAppInput(runner.action);

    if (!azureFunctionAppInput) throw new Error('TODO');

    const context = await azureFunctionAppInput.toContext(runner, input, invocationContext);

    context.azureFunctionAppInput = azureFunctionAppInput;

    for (const onContext of runner.action['@azure:function-app:on-context']) await onContext(context);

    return context;
  }

  public toReturn(payload: unknown, context: Context) {
    return context.azureFunctionAppInput.toReturn(payload, context);
  }

  public onAction(action: ActionMetadata): void | Promise<void> {
    const outputs = getMetadataArgsStorage()
      .args('@azure:function-app:outputs')
      .filter(arg => tools.isMetadataArgumentWithPropertyKeyFor(action, arg));

    action['@azure:function-app:on-context'] = outputs.map(output => output.onContext.bind(output)).filter(Boolean);

    const azureFunctionAppInput = this.findAzureFunctionAppInput(action);

    if (!azureFunctionAppInput) throw new Error('TODO');

    azureFunctionAppInput.register(
      new Runner(action),
      outputs.map(output => output.output),
    );
  }
}
