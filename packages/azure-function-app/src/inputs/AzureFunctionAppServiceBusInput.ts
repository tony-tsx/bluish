import { ActionMetadata, Runner } from '@bluish/core';
import { FunctionOutput, InvocationContext, app } from '@azure/functions';

import { AzureFunctionAppInput } from '../models/AzureFunctionAppInput.js';
import { AzureFunctionServiceBusContext } from '../models/AzureFunctionServiceBusContext.js';

export class AzureFunctionAppServiceBusInput extends AzureFunctionAppInput {
  constructor(protected readonly connection?: string) {
    super();
  }

  public test(action: ActionMetadata): boolean {
    return (
      action.is('@azure:function-app:input:service-bus:topic') ||
      action.is('@azure:function-app:input:service-bus:queue')
    );
  }

  protected registerQueue(runner: Runner<'@azure:function-app:input:service-bus:queue'>, outputs: FunctionOutput[]) {
    let connection = runner.action.args['@azure:function-app:input:service-bus:queue:connection'];

    if (!connection) connection = this.connection;

    if (!connection) throw new TypeError('Connection string is required');

    app.serviceBusQueue(`SERVICE_BUS_QUEUE_${this.getInputNameByAction(runner.action)}`, {
      queueName: runner.action.args['@azure:function-app:input:service-bus:queue:name'],
      connection,
      extraOutputs: outputs,
      handler: runner.toFunction(),
    });
  }

  protected registerTopic(runner: Runner<'@azure:function-app:input:service-bus:topic'>, outputs: FunctionOutput[]) {
    let connection = runner.action.args['@azure:function-app:input:service-bus:topic:connection'];

    if (!connection) connection = this.connection;

    if (!connection) throw new TypeError('Connection string is required');

    app.serviceBusTopic(`SERVICE_BUS_TOPIC_${this.getInputNameByAction(runner.action)}`, {
      topicName: runner.action.args['@azure:function-app:input:service-bus:topic:name'],
      subscriptionName: runner.action.args['@azure:function-app:input:service-bus:topic:subscription'],
      connection,
      extraOutputs: outputs,
      handler: runner.toFunction(),
    });
  }

  public register(
    runner: Runner<'@azure:function-app:input:service-bus:topic' | '@azure:function-app:input:service-bus:queue'>,
    outputs: FunctionOutput[],
  ) {
    if (runner.action.is('@azure:function-app:input:service-bus:queue'))
      return this.registerQueue(runner as Runner<'@azure:function-app:input:service-bus:queue'>, outputs);

    if (runner.action.is('@azure:function-app:input:service-bus:topic'))
      return this.registerTopic(runner as Runner<'@azure:function-app:input:service-bus:topic'>, outputs);

    throw new TypeError('Invalid action type');
  }

  public toContext(runner: Runner, queueItem: unknown, invocationContext: InvocationContext) {
    return new AzureFunctionServiceBusContext(queueItem, invocationContext);
  }

  public toReturn(payload: unknown) {
    return payload;
  }
}

declare global {
  namespace Bluish {
    interface ActionMetadataArgMapByType {
      '@azure:function-app:input:service-bus:queue': {
        '@azure:function-app:input:service-bus:queue:name': string;
        '@azure:function-app:input:service-bus:queue:connection'?: string;
      };
      '@azure:function-app:input:service-bus:topic': {
        '@azure:function-app:input:service-bus:topic:name': string;
        '@azure:function-app:input:service-bus:topic:subscription': string;
        '@azure:function-app:input:service-bus:topic:connection'?: string;
      };
    }
  }
}
