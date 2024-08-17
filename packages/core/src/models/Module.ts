import { Context } from './Context.js'
import { getMetadataArgsStorage } from './MetadataArgsStorage.js'
import { ApplicationInjectable } from './ApplicationInjectable.js'
import { Application } from './Application.js'
import { InjectableNotFoundError } from '../errors/InjectableNotFoundError.js'

const storage = new Map<unknown, unknown>()

const refs = new Map<unknown, ApplicationInjectable>()

export class Module {
  #store = new Map<unknown, unknown>()

  public readonly context!: Context
  public readonly application!: Application

  public get pipes() {
    if (this.context) return this.context.action.pipes

    return this.application.pipes
  }

  constructor(public readonly scope: Application | Context) {
    if (scope instanceof Application) this.application = scope
    else if (scope instanceof Context) this.context = scope
    else throw new Error('TODO')
  }

  public find(ref: unknown) {
    if (!refs.has(ref)) {
      const _injectable = getMetadataArgsStorage().injectables.find(
        injectable => injectable.ref === ref,
      )

      if (!_injectable) throw new InjectableNotFoundError('TODO')

      refs.set(ref, new ApplicationInjectable(_injectable))
    }

    return refs.get(ref)!
  }

  public has(ref: unknown) {
    return getMetadataArgsStorage().injectables.some(
      injectable => injectable.ref === ref,
    )
  }

  public resolve(ref: unknown) {
    if (!this.has(ref)) throw new Error('TODO')

    if (storage.has(ref)) return storage.get(ref)

    if (this.#store.has(ref)) return this.#store.get(ref)

    const injectable = this.find(ref)

    const value = injectable.toInstance(this)

    if (injectable.scope === 'transient') return value

    if (injectable.scope === 'context') {
      this.#store.set(ref, value)

      value.then(value => this.#store.set(ref, value))

      return value
    }

    return value
  }
}
