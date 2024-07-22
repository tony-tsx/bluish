import { Construtable } from '../typings/Class.js'
import { Injectable } from '../decorators/Injectable.js'
import { InjectableReference } from '../typings/InjectableReference.js'
import { Context } from './Context.js'

export class Module {
  private _injectables = new Map<unknown, unknown>()

  private get _application() {
    return this.context.runner.action.controller.application
  }

  constructor(public readonly context: Context) {}

  protected _cast(injectable: Injectable) {
    const args: unknown[] = []

    if (injectable.resolve) return injectable.resolve(this.context)

    for (const [
      parameterIndex,
      injectableReference,
    ] of injectable.injects.parameters.entries())
      args[parameterIndex] = this.resolve(injectableReference)

    const instance = new (injectable.target as Construtable<unknown>)(...args)

    for (const [
      propertyKey,
      injectableReference,
    ] of injectable.injects.properties.entries())
      Object.defineProperty(instance, propertyKey, {
        value: this.resolve(injectableReference),
        writable: false,
        enumerable: false,
        configurable: false,
      })

    return instance
  }

  public resolve(ref: InjectableReference) {
    const injectable = this._application['_findInjectable'](ref)

    if (!injectable) throw new Error('Injectable not found')

    if (injectable.scope === 'singleton') {
      if (!this._application['_injectables'].has(injectable))
        throw new Error('Injectable not found')

      return this._application['_injectables'].get(injectable)
    }

    if (injectable.scope === 'request') {
      if (!this._injectables.has(injectable))
        this._injectables.set(injectable, this._cast(injectable))

      return this._injectables.get(injectable)
    }

    return this._cast(injectable)
  }
}
