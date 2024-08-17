import { Pipe } from '../decorators/Pipe.js'
import { SelectorFunction } from '../decorators/Selector.js'
import { Class, Constructable } from '../typings/Class.js'
import { Context } from './Context.js'
import { AnyMiddleware } from './Middleware.js'

export interface MetadataControllerArg {
  target: Constructable
  inherit?: () => Class
  middlewares?: AnyMiddleware[]
}

export interface MetadataActionArg {
  context?: Class<Context>
  target: Class | object
  virtualizer?: (context: Context) => unknown
  propertyKey?: string | symbol
  middlewares?: AnyMiddleware[]
}

export interface MetadataArg {
  target: Class | object
  propertyKey: undefined | string | symbol
  parameterIndex: undefined | number
  key: string | symbol
  value: unknown | (() => unknown)
  reducer?: (value: any, previous: any) => any
}

export interface MetadataMiddlewareArg {
  target: Class | object
  propertyKey?: string | symbol
  middleware: AnyMiddleware
}

export interface MetadataIsolatedArg {
  target: Class | object
  propertyKey?: string | symbol
}

export interface MetadataInjectArg {
  target: Class | object
  propertyKey?: undefined | string | symbol
  parameterIndex?: undefined | number
  ref?: any
}

export interface MetadataSelectorArg {
  target: Class | object
  propertyKey?: undefined | string | symbol
  parameterIndex?: undefined | number
  context: Class<Context>
  selector: SelectorFunction
}

export interface MetadataInjectableArg {
  ref: any
  scope: 'singleton' | 'context' | 'transient'
  target?: Constructable
  virtualizer?: (() => unknown) | ((context: Context) => unknown)
}

export interface MetadataInjectableHoistingArg {
  target: Class | object
  propertyKey: string | symbol
}

export interface MetadataPipeArg {
  target: Class | object
  propertyKey?: string | symbol
  parameterIndex?: undefined | number
  description?: TypedPropertyDescriptor<any>
  pipe: Pipe
}

export class MetadataArgsStorage {
  public readonly actions: MetadataActionArg[] = []

  public readonly middlewares: MetadataMiddlewareArg[] = []

  public readonly isolated: MetadataIsolatedArg[] = []

  public readonly injects: MetadataInjectArg[] = []

  public readonly selectors: MetadataSelectorArg[] = []

  public readonly pipes: MetadataPipeArg[] = []

  public readonly injectables: MetadataInjectableArg[] = []

  public readonly injectableHoistings: MetadataInjectableHoistingArg[] = []

  public readonly controllers: MetadataControllerArg[] = []

  public readonly metadatas: MetadataArg[] = []
}

export const BLUISH_METADATA_ARGS_STORAGE = '__BLUISH_METADATA_ARGS_STORAGE__'

export function getMetadataArgsStorage(): MetadataArgsStorage {
  const _global = globalThis as any

  _global[BLUISH_METADATA_ARGS_STORAGE] ??= new MetadataArgsStorage()

  return _global[BLUISH_METADATA_ARGS_STORAGE]
}
