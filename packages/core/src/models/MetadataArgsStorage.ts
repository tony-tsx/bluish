import { ControllerMetadataArgs as _ControllerMetadataArgs } from '../metadata-args/ControllerMetadataArgs.js';
import { ActionMetadataArgs as _ActionMetadataArgs } from '../metadata-args/ActionMetadataArgs.js';
import { IsolatedMetadataArgs as _IsolatedMetadataArgs } from '../metadata-args/IsolatedMetadataArgs.js';
import { MiddlewareMetadataArgs as _MiddlewareMetadataArgs } from '../metadata-args/MiddlewareMetadataArgs.js';
import { ArgumentMetadataArgs as _ArgumentMetadataArgs } from '../metadata-args/ArgumentMetadataArgs.js';
import { WrapperMetadataArgs as _WrapperMetadataArgs } from '../metadata-args/WrapperMetadataArgs.js';

export class MetadataArgsStorage {
  public args<K extends keyof this[' _args']>(target: K): this[' _args'][K][];
  public args<K extends keyof this[' _args']>(target: K, arg: this[' _args'][K]): this;
  public args<K extends keyof this[' _args']>(target: K, arg?: this[' _args'][K]): this | this[' _args'][K][] {
    // @ts-expect-error: TODO
    this[target] ??= [];

    // @ts-expect-error: TODO
    if (!arg) return this[target];

    // @ts-expect-error: TODO
    this[target].push(arg);

    return this;
  }
}

export interface MetadataArgsStorage extends Bluish.MetadataArgsStorage {
  [' _args']: {
    [TKey in keyof Bluish.MetadataArgsStorage]: Bluish.MetadataArgsStorage[TKey] extends readonly (infer TArg)[]
      ? TArg
      : never;
  };
}

declare global {
  namespace Bluish {
    interface MetadataArgsStorage {
      readonly controllers: readonly _ControllerMetadataArgs[];
      readonly middlewares: readonly _MiddlewareMetadataArgs[];
      readonly arguments: readonly _ArgumentMetadataArgs[];
      readonly actions: readonly _ActionMetadataArgs[];
      readonly isolateds: readonly _IsolatedMetadataArgs[];
      readonly wrappers: readonly _WrapperMetadataArgs[];
    }
  }
}
