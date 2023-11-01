import { FunctionOutput } from '@azure/functions';
import { Context, HandlerMetadata, Runner } from '@bluish/core';

export abstract class AzureFunctionAppInput {
  public abstract test(handler: HandlerMetadata): boolean;

  public abstract register(runner: Runner, outputs: FunctionOutput[]): void;

  protected getHandlerName(handler: HandlerMetadata) {
    return handler.target.name;
  }

  protected getHandlerPropertyName(handler: HandlerMetadata) {
    if (typeof handler.propertyKey === 'symbol') return `:${handler.propertyKey.description}`;

    return handler.propertyKey;
  }

  public abstract toContext(runner: Runner, ...args: any[]): Context | Promise<Context>;

  public abstract toReturn(payload: unknown, context: Context): any | Promise<any>;
}
