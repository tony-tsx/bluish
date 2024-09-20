import { Class } from '../typings/Class.js'

export namespace is {
  export function string(value: unknown): value is string {
    return typeof value === 'string'
  }

  export function symbol(value: unknown): value is symbol {
    return typeof value === 'symbol'
  }

  export function propertyKey(value: unknown): value is string | symbol {
    return string(value) || symbol(value)
  }

  export function array<T = any>(value: unknown): value is T[] {
    return Array.isArray(value)
  }

  export function func(value: unknown): value is (...args: any[]) => any {
    return typeof value === 'function'
  }

  export function object<T extends object = object>(
    value: unknown,
  ): value is T {
    return value !== null && typeof value === 'object' && !array(value)
  }

  export function constructor<T = object>(
    target: any,
    ref: Class<T> = Object as unknown as Class<T>,
  ): target is Class<T> {
    if (typeof target !== 'function') return false

    if (target === ref) return true

    if (target.prototype instanceof ref) return true

    return false
  }
}
