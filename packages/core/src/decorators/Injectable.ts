import { Context } from '../models/Context.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Class } from '../typings/Class.js'
import { InjectableReference } from '../typings/InjectableReference.js'

export interface SingletonInjectableOptions {
  scope?: 'singleton'
}

//  | 'transient' | 'request'

export interface TransientInjectableOptions {
  scope: 'transient'
  resolve?: (context: Context) => unknown
}

export interface RequestInjectableOptions {
  scope: 'request'
  resolve?: (context: Context) => unknown
}

export type InjectableOptions =
  | SingletonInjectableOptions
  | TransientInjectableOptions
  | RequestInjectableOptions

export function Injectable(target: Class): void
export function Injectable(target: Class, options?: InjectableOptions): void
export function Injectable(options: InjectableOptions): (target: Class) => void
export function Injectable(id: string | symbol): (target: Class) => void
export function Injectable(
  id: string | symbol,
  options: InjectableOptions,
): (target: Class) => void
export function Injectable(
  targetOrOptionsOrId: Class | InjectableOptions | string | symbol,
  maybeOptions?: InjectableOptions,
) {
  if (typeof targetOrOptionsOrId === 'function') {
    getMetadataArgsStorage().injectables.push({
      target: targetOrOptionsOrId,
      scope: 'singleton',
      ...maybeOptions,
    })

    return
  }

  if (typeof targetOrOptionsOrId === 'object')
    return (target: Class) => {
      getMetadataArgsStorage().injectables.push({
        target,
        scope: 'singleton',
        ...targetOrOptionsOrId,
      })
    }

  return (target: Class) => {
    getMetadataArgsStorage().injectables.push({
      target,
      id: targetOrOptionsOrId,
      scope: 'singleton',
      ...maybeOptions,
    })
  }
}

export interface Injectable {
  id: undefined | string | symbol
  target: Class | undefined
  scope: 'singleton' | 'transient' | 'request'
  resolve: undefined | ((context: Context) => unknown)
  injects: {
    static: Map<string | symbol, InjectableReference>
    parameters: Map<number, InjectableReference>
    properties: Map<string | symbol, InjectableReference>
  }
}
