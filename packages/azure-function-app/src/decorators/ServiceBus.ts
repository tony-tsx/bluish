import { Action, Argument } from '@bluish/core';

import { AzureFunctionServiceBusContext } from '../models/AzureFunctionServiceBusContext.js';

export namespace ServiceBus {
  type Decorator = (target: Function | object, propertyKey: string | symbol, parameterIndex: number) => void;

  export function Queue(queueName: string): Decorator;
  export function Queue(connection: string, queueName: string): Decorator;
  export function Queue(queueNameOrConnection: string, maybeQueueName?: string) {
    const queueName = maybeQueueName ? maybeQueueName : queueNameOrConnection;
    const connection = maybeQueueName ? queueNameOrConnection : undefined;

    return (target: Function | object, propertyKey: string | symbol, parameterIndex: number) => {
      Action('@azure:function-app:input:service-bus:queue', {
        '@azure:function-app:input:service-bus:queue:name': queueName,
        '@azure:function-app:input:service-bus:queue:connection': connection,
      })(target, propertyKey);

      Argument(context => {
        if (context instanceof AzureFunctionServiceBusContext) return context.queueItem;
        return null;
      })(target, propertyKey, parameterIndex);
    };
  }

  export function Topic(topicName: string, subscriptionName: string): Decorator;
  export function Topic(connection: string, topicName: string, subscriptionName: string): Decorator;
  export function Topic(
    topicNameOrConnection: string,
    subscriptionNameOrTopicName: string,
    maybeSubscriptionName?: string,
  ) {
    const topicName = maybeSubscriptionName ? subscriptionNameOrTopicName : topicNameOrConnection;
    const subscriptionName = maybeSubscriptionName ? maybeSubscriptionName : subscriptionNameOrTopicName;
    const connection = maybeSubscriptionName ? topicNameOrConnection : undefined;

    return (target: Function | object, propertyKey: string | symbol, parameterIndex: number) => {
      Action('@azure:function-app:input:service-bus:topic', {
        '@azure:function-app:input:service-bus:topic:subscription': subscriptionName,
        '@azure:function-app:input:service-bus:topic:name': topicName,
        '@azure:function-app:input:service-bus:topic:connection': connection,
      })(target, propertyKey);

      Argument(context => {
        if (context instanceof AzureFunctionServiceBusContext) return context.queueItem;
        return null;
      })(target, propertyKey, parameterIndex);
    };
  }
}
