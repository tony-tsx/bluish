import { ActionArgumentEvent, Middleware, Use } from '@bluish/core';
import { analyze } from 'ornate-guard';

import 'reflect-metadata';
import { getReflectMetadataParamTypeFromAction } from './getReflectMetadataParamTypesFromAction.js';

class GuardMiddleware extends Middleware {
  constructor(
    public readonly parameterIndex: number,
    public readonly getSchema?: () => Function,
  ) {
    super();
  }

  public async onArgument(event: ActionArgumentEvent): Promise<void> {
    if (event.parameterIndex !== this.parameterIndex) return;

    const value = event.value as object;

    const schema = this.getSchema
      ? this.getSchema()
      : getReflectMetadataParamTypeFromAction(event.context.runner.action, event.parameterIndex);

    const result = await analyze(value, schema);

    if (result.status === 'fulfilled') event.value = result.value;
    else throw result.reason;
  }
}

export function IsGuard(): (target: Function) => void;
export function IsGuard(
  schema?: () => new () => object,
): (target: Function | object, propertyKey: string | symbol, parameterIndex: number) => void;
export function IsGuard(getSchema?: () => new () => object) {
  return (target: Function | object, propertyKey?: string | symbol, parameterIndex?: number) => {
    if (!propertyKey)
      if (typeof target !== 'function') throw new TypeError('IsGuard cannot be used as a class decorator');
      else IsGuard.storage.add(target);
    else return Use(new GuardMiddleware(parameterIndex!, getSchema))(target, propertyKey);
  };
}

IsGuard.storage = new Set<Function>();

declare global {
  namespace Bluish {
    interface Application {
      schemas: Set<Function>;
    }
    interface MetadataArgsStorage {}
  }
}
