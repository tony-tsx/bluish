import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Constructable } from '../typings/Class.js'

const scopes: unknown[] = ['singleton', 'transient', 'context']

export interface InjectableOption {
  scope: 'singleton' | 'transient' | 'context'
}

export function Injectable(target: Constructable): void
export function Injectable(
  scope: 'singleton' | 'transient' | 'context',
): (target: Constructable) => void
export function Injectable(ref: unknown): (target: Constructable) => void
export function Injectable(
  targetOrScopeOrRef:
    | Constructable
    | 'singleton'
    | 'transient'
    | 'context'
    | unknown,
) {
  if (typeof targetOrScopeOrRef === 'function') {
    getMetadataArgsStorage().injectables.push({
      type: 'injectable',
      target: targetOrScopeOrRef as Constructable,
      ref: targetOrScopeOrRef,
      scope: 'singleton',
    })

    return
  }

  if (scopes.includes(targetOrScopeOrRef))
    return (target: Constructable) => {
      getMetadataArgsStorage().injectables.push({
        type: 'injectable',
        target,
        ref: target,
        scope: targetOrScopeOrRef as 'singleton' | 'transient' | 'context',
      })
    }

  return (target: Constructable) => {
    getMetadataArgsStorage().injectables.push({
      type: 'injectable',
      target,
      ref: targetOrScopeOrRef,
      scope: 'singleton',
    })
  }
}

function register(
  ref: unknown,
  scope: 'singleton' | 'transient' | 'context',
  handle: (...args: any[]) => unknown,
  ...refs: any[]
) {
  getMetadataArgsStorage().injectables.push({
    type: 'injectable',
    ref,
    scope,
    virtualizer: { handle, refs },
  })
}

Injectable.register = register
