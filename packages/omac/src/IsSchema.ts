import { HandlerExecuteParameterEvent, Middleware, Use, onApp } from '@bluish/core';
import { analyze } from 'omac';
import 'reflect-metadata';

class SchemaMiddleware extends Middleware {
  constructor(
    public readonly parameterIndex: number,
    public readonly getSchema?: () => Function,
  ) {
    super();
  }

  public async onParameter(event: HandlerExecuteParameterEvent): Promise<void> {
    if (event.parameterIndex !== this.parameterIndex) return;

    const value = event.value as object;

    const schema = this.getSchema
      ? this.getSchema()
      : (() => {
          const types = Reflect.getMetadata(
            'design:paramtypes',
            event.context.runner.handler.isStatic
              ? event.context.runner.handler.target
              : event.context.runner.handler.target.prototype,
            event.context.runner.handler.propertyKey,
          );

          return types[this.parameterIndex];
        })();

    const result = await analyze(value, schema);

    if (result.status === 'fulfilled') event.value = result.value;
    else throw result.reason;
  }
}

export function IsSchema(): (target: Function) => void;
export function IsSchema(
  schema?: () => new () => object,
): (target: Function | object, propertyKey: string | symbol, parameterIndex: number) => void;
export function IsSchema(getSchema?: () => new () => object) {
  return (target: Function | object, propertyKey?: string | symbol, parameterIndex?: number) => {
    if (!propertyKey)
      return onApp(app => {
        app.schemas ??= new Set();

        app.schemas.add(target as Function);
      });

    return Use(new SchemaMiddleware(parameterIndex!, getSchema))(target, propertyKey);
  };
}

declare global {
  namespace Bluish {
    interface App {
      schemas: Set<Function>;
    }
    interface MetadataArgsStorage {}
  }
}
