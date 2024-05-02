import { FunctionOutput } from '@azure/functions';
import { Context, ActionMetadata, Runner } from '@bluish/core';

export abstract class AzureFunctionAppInput {
  public abstract test(handler: ActionMetadata): boolean;

  public abstract register(runner: Runner, outputs: FunctionOutput[]): void;

  protected getControllerName(action: ActionMetadata) {
    return action.target.constructor.name;
  }

  protected getActionPropertyName(action: ActionMetadata) {
    if (typeof action.propertyKey === 'symbol') return `_${action.propertyKey.description}`;

    return action.propertyKey;
  }

  public getInputNameByAction(action: ActionMetadata) {
    return `${this.getControllerName(action)}${action.isStatic ? '__' : '_'}${this.getActionPropertyName(action)}`;
  }

  public abstract toContext(runner: Runner, ...args: any[]): Context | Promise<Context>;

  public abstract toReturn(payload: unknown, context: Context): any | Promise<any>;
}
