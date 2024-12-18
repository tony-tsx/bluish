import { Context } from './Context.js'
import { getMetadataArgsStorage } from './MetadataArgsStorage.js'
import { ApplicationInjectable } from './ApplicationInjectable.js'
import { Application } from './Application.js'
import { InjectableNotFoundError } from '../errors/InjectableNotFoundError.js'

const singletons = new Map<Application, Map<unknown, unknown>>()

const refs = new Map<Application, Map<unknown, ApplicationInjectable>>()

function refToString(ref: unknown) {
  if (typeof ref === 'string') return `string:${ref}`
  if (typeof ref === 'symbol') return `symbol:${ref.description}`
  if (typeof ref === 'function') return `function:${ref.name}`
  if (ref === null) return 'null'
  if (typeof ref === 'object') return `object:${ref.constructor.name}`
  return `unknown:${ref}`
}

export class Module {
  #context = new Map<unknown, unknown>()

  public readonly context!: Context

  public readonly application!: Application

  constructor(public readonly scope: Application | Context) {
    if (scope instanceof Application) this.application = scope
    else if (scope instanceof Context) {
      this.context = scope
      Object.defineProperty(this, 'application', {
        get: () => this.context.action.controller.application,
        enumerable: false,
        configurable: false,
      })
    } else throw new Error('TODO')
  }

  public hasSingleton(ref: unknown) {
    if (!singletons.has(this.application))
      singletons.set(this.application, new Map())

    return singletons.get(this.application)!.has(ref)
  }

  public getSingleton(ref: unknown) {
    if (!this.hasSingleton(ref)) throw new Error('TODO')

    return singletons.get(this.application)!.get(ref)
  }

  public hasRef(ref: unknown) {
    if (!refs.has(this.application)) refs.set(this.application, new Map())

    return refs.get(this.application)!.has(ref)
  }

  public getRef(ref: unknown) {
    if (!this.hasRef(ref)) throw new Error('TODO')

    return refs.get(this.application)!.get(ref)
  }

  public setRef(ref: unknown, injectable: ApplicationInjectable) {
    if (!refs.has(this.application)) refs.set(this.application, new Map())

    refs.get(this.application)!.set(ref, injectable)
  }

  public find(ref: unknown) {
    if (!this.hasRef(ref)) {
      const _injectable = getMetadataArgsStorage().injectables.find(
        injectable => injectable.ref === ref,
      )

      if (!_injectable) throw new InjectableNotFoundError('TODO')

      this.setRef(ref, new ApplicationInjectable(this.application, _injectable))
    }

    return this.getRef(ref)!
  }

  public has(ref: unknown) {
    return getMetadataArgsStorage().injectables.some(
      injectable => injectable.ref === ref,
    )
  }

  public resolve<T>(ref: unknown): T | Promise<T> {
    if (!this.has(ref))
      throw new TypeError(
        `reference not found in argument list: ${refToString(ref)}`,
      )

    if (this.hasSingleton(ref)) return this.getSingleton(ref) as T

    if (this.#context.has(ref)) return this.#context.get(ref) as T

    const injectable = this.find(ref)

    const value = injectable.to(this)

    if (injectable.scope === 'transient') return value as T

    if (injectable.scope === 'context') {
      this.#context.set(ref, value)

      value.then(
        value => this.#context.set(ref, value),
        () => {
          /* ignore here! */
        },
      )

      return value as T
    }

    return value as T
  }
}
