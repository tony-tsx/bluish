import { PipeFunction } from '../decorators/UsePipe.js'
import { InputInjectSelector } from '../decorators/Input.js'
import { Class, Constructable } from '../typings/Class.js'
import { Context } from './Context.js'
import { AnyMiddleware } from './Middleware.js'
import { ControllerInheritsOptions } from '../decorators/Controller.js'
import { IUsable } from '../decorators/Use.js'
import { ApplicationSourceMetadataEntry } from './ApplicationSourceMetadata.js'
import { ApplicationSourceAction } from './ApplicationSourceAction.js'
import { ApplicationSource } from './ApplicationSource.js'

export interface IVirtual {
  handle(...args: any[]): any
  refs: any[]
}

export interface IMetadataArg<TType extends string> {
  readonly type: TType
}

export interface MetadataControllerArg extends IMetadataArg<'controller'> {
  target: Constructable
  inherit?: ControllerInheritsOptions
  middlewares?: AnyMiddleware[]
  construct?: (controller: ApplicationSource) => void | Promise<void>
}

export interface MetadataActionArg extends IMetadataArg<'action'> {
  context?: Class<Context>
  target: Class | object
  virtualizer?: IVirtual
  propertyKey?: string | symbol
  propertyDescriptor?: TypedPropertyDescriptor<any>
  parameterIndex?: number
  middlewares?: (AnyMiddleware[] | undefined)[]
  metadata?: ApplicationSourceMetadataEntry[] | Record<string | symbol, any>
  options?: object
  construct?: (
    applicationSourceAction: ApplicationSourceAction,
    options: any,
  ) => void | Promise<void>
}

export interface MetadataArg extends IMetadataArg<'metadata'> {
  target: Class | object
  propertyKey?: undefined | string | symbol
  parameterIndex?: undefined | number
  propertyDescriptor?: TypedPropertyDescriptor<any>
  key: unknown
  value: unknown | (() => unknown)
  reducer?: (value: any, previous: any) => any
}

export interface MetadataMiddlewareArg extends IMetadataArg<'middleware'> {
  target: Class | object
  propertyKey?: string | symbol
  parameterIndex?: undefined
  propertyDescriptor?: TypedPropertyDescriptor<any>
  middleware: AnyMiddleware
}

export interface MetadataUsableArg extends IMetadataArg<'usable'> {
  target: Class | object
  propertyKey?: undefined | string | symbol
  parameterIndex?: undefined | number
  propertyDescriptor?: undefined | TypedPropertyDescriptor<any>
  usable: IUsable
}

export interface MetadataIsolatedArg extends IMetadataArg<'isolated'> {
  target: Class | object
  propertyKey?: string | symbol
  propertyDescriptor?: undefined | TypedPropertyDescriptor<any>
}

export interface MetadataInjectArg extends IMetadataArg<'inject'> {
  target: Class | object
  propertyKey?: undefined | string | symbol
  parameterIndex?: undefined | number
  ref?: any
}

export interface MetadataInputArg extends IMetadataArg<'input'> {
  target: Class | object
  propertyKey?: undefined | string | symbol
  parameterIndex?: undefined | number
  deps?: (string | symbol)[]
  context?: Class<Context>
  selector: InputInjectSelector
}

export interface MetadataInjectableArg extends IMetadataArg<'injectable'> {
  ref: any
  scope: 'singleton' | 'context' | 'transient'
  target?: Constructable
  virtualizer?: IVirtual
}

export interface MetadataInjectableHoistingArg
  extends IMetadataArg<'injectable-hoisting'> {
  target: Class | object
  propertyKey: string | symbol
}

export interface MetadataPipeArg extends IMetadataArg<'pipe'> {
  target: Class | object
  propertyKey?: undefined | string | symbol
  parameterIndex?: undefined | number
  propertyDescriptor?: undefined | TypedPropertyDescriptor<any>
  pipe: PipeFunction
}

export class MetadataArgsStorage {
  public readonly actions: MetadataActionArg[] = []

  public readonly isolated: MetadataIsolatedArg[] = []

  public readonly injects: MetadataInjectArg[] = []

  public readonly middlewares: MetadataMiddlewareArg[] = []

  public readonly inputs: MetadataInputArg[] = []

  public readonly usables: MetadataUsableArg[] = []

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
