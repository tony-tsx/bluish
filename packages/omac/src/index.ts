import {
  HandlerExecuteErrorEvent,
  HandlerExecuteParameterEvent,
  HandlerMetadata,
  Middleware,
  getMetadataArgsStorage,
  isForMetadataArgs,
} from '@bluish/core';
import { ValidationError, analyze } from 'omac';

import { OmacValidateMetadataArgs } from './Validate.js';

export class OmacValidation {
  constructor(public readonly arg: OmacValidateMetadataArgs) {}

  public validate() {
    const schema = this.arg.get();

    schema;
  }
}

export class OmacMiddleware extends Middleware {
  constructor(
    public readonly handle: (error: ValidationError, event: HandlerExecuteErrorEvent) => void | Promise<void>,
  ) {
    super();
  }

  public onHandler(metadata: HandlerMetadata): void | Promise<void> {
    getMetadataArgsStorage()
      .args('@omac:validations')
      .forEach(args => {
        if (!isForMetadataArgs(metadata.target, args)) return;

        if (args.propertyKey !== metadata.propertyKey) return;

        metadata['@omac:validations'] ??= new Map();

        metadata['@omac:validations'].set(args.parameterIndex, new OmacValidation(args));
      });
  }

  public async onParameter(event: HandlerExecuteParameterEvent): Promise<void> {
    const validation = event.context.runner.handler['@omac:validations'].get(event.parameterIndex);

    if (!validation) return;

    const result = await analyze(event.value as object, validation.arg.get());

    if (result.status === 'fulfilled') event.value = result.value;
    else throw result.reason;
  }

  public onError(event: HandlerExecuteErrorEvent): void | Promise<void> {
    if (!(event.error instanceof ValidationError)) return;

    return this.handle(event.error, event);
  }
}

declare global {
  namespace Bluish {
    interface HandlerMetadata {
      '@omac:validations': Map<number, OmacValidation>;
    }
  }
}
