import { Class } from '../typings/Class.js'
import { InjectableReference } from '../typings/InjectableReference.js'
import { Context } from './Context.js'
import { Middleware } from './Middleware.js'

export interface ControllerArg {
  target: Class
  middlewares: Middleware[]
  isIsolated: boolean
  inherit?: () => Class
}

export interface ActionArg<
  TType extends keyof Bluish.Action.Types = keyof Bluish.Action.Types,
> {
  context: Class<Context>
  target: Class | object
  propertyKey: string | symbol
  middlewares: Middleware[]
  configuration: Bluish.Action.Types[TType] extends never
    ? {}
    : Bluish.Action.Types[TType]
}

export interface MetadataArg<
  TKey extends keyof Bluish.Action.Metadata = keyof Bluish.Action.Metadata,
> {
  target: Class | object
  propertyKey?: string | symbol
  key: TKey
  value: Bluish.Action.Metadata[TKey]
  reducer: (
    value: Bluish.Action.Metadata[TKey],
    previous: Bluish.Action.Metadata[TKey],
  ) => Bluish.Action.Metadata[TKey]
}

export interface MiddlewareArg {
  target: Class | object
  propertyKey?: string | symbol
  middleware: Middleware
}

export interface IsolatedArg {
  target: Class | object
  propertyKey?: string | symbol
}

export interface SelectorArg {
  context: Class<Context>
  target: Class | object
  propertyKey: string | symbol
  parameterIndex: number
  selector: (context: Context) => unknown
}

export interface InjectArg {
  target: Class | object
  propertyKey: string | symbol | undefined
  parameterIndex: number | undefined
  injectable: InjectableReference
}

export interface InjectableArg {
  id?: string | symbol
  target?: Class
  scope: 'singleton' | 'request' | 'transient'
  resolve?: (context: Context) => unknown
}

export class MetadataArgsStorage {
  readonly actions: ActionArg[] = []

  readonly middlewares: MiddlewareArg[] = []

  readonly isolated: IsolatedArg[] = []

  readonly selectors: SelectorArg[] = []

  readonly injects: InjectArg[] = []

  readonly injectables: InjectableArg[] = []

  readonly controllers: ControllerArg[] = []

  readonly metadatas: MetadataArg[] = []
}

export function getMetadataArgsStorage() {
  if (!(globalThis as any).__bluishMetadataArgsStorage) {
    ;(globalThis as any).__bluishMetadataArgsStorage = new MetadataArgsStorage()
  }

  return (globalThis as any).__bluishMetadataArgsStorage as MetadataArgsStorage
}

declare global {
  namespace Bluish {
    interface ExtraMetadataArgs {
      [key: string]: {}
    }
  }
}
