import { Context, Driver, HandlerMetadata, Runner, getMetadataArgsStorage, isForMetadataArgs } from '@bluish/core';
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

  protected findAzureFunctionAppInput(handler: HandlerMetadata) {
    return this.inputs.find(input => input.test(handler));
  }

  public async toContext(runner: Runner, input: any, invocationContext: InvocationContext): Promise<Context> {
    const azureFunctionAppInput = this.findAzureFunctionAppInput(runner.handler);

    if (!azureFunctionAppInput) throw new Error('TODO');

    const context = await azureFunctionAppInput.toContext(runner, input, invocationContext);

    context.azureFunctionAppInput = azureFunctionAppInput;

    for (const onContext of runner.handler['@azure:function-app:on-context']) await onContext(context);

    return context;
  }

  public toReturn(payload: unknown, context: Context) {
    return context.azureFunctionAppInput.toReturn(payload, context);
  }

  public onHandler(handler: HandlerMetadata): void | Promise<void> {
    const outputs = getMetadataArgsStorage()
      .args('@azure:function-app:outputs')
      .filter(arg => isForMetadataArgs(handler.target, arg) && handler.propertyKey === arg.propertyKey);

    handler['@azure:function-app:on-context'] = outputs.map(output => output.onContext.bind(output)).filter(Boolean);

    const azureFunctionAppInput = this.findAzureFunctionAppInput(handler);

    if (!azureFunctionAppInput) throw new Error('TODO');

    azureFunctionAppInput.register(
      new Runner(handler),
      outputs.map(output => output.output),
    );
  }
}
