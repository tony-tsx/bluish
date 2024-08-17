import { InjectOutOfScopeError } from '../errors/InjectOutOfScopeError.js'
import { isMatchToClass } from '../tools/isMatchToClass.js'
import { Constructable } from '../typings/Class.js'
import { ApplicationSourceArguments } from './ApplicationSourceArguments.js'
import { ApplicationSourceProperties } from './ApplicationSourceProperties.js'
import { Context } from './Context.js'
import {
  getMetadataArgsStorage,
  MetadataInjectableArg,
} from './MetadataArgsStorage.js'
import { Module } from './Module.js'

export class ApplicationInjectable {
  #singleton: unknown

  public readonly ref: any

  public readonly target: Constructable | undefined

  public readonly scope: 'singleton' | 'transient' | 'context'

  public readonly hoisting: string | symbol | undefined

  public readonly arguments = new ApplicationSourceArguments()

  public readonly properties = new ApplicationSourceProperties()

  public virtualizer:
    | undefined
    | (() => unknown)
    | ((context: Context) => unknown)

  constructor(public readonly _injectable: MetadataInjectableArg) {
    this.ref = this._injectable.ref
    this.target = this._injectable.target
    this.virtualizer = this._injectable.virtualizer
    this.scope = this._injectable.scope

    const args = getMetadataArgsStorage()

    if (!this.target) return this

    for (const _selector of args.selectors) {
      if (!isMatchToClass(this.target, _selector.target)) continue

      if (_selector.propertyKey === undefined) {
        if (_selector.parameterIndex === undefined) throw new Error('TODO')

        this.arguments.selectors.add(_selector)

        continue
      }

      if (_selector.parameterIndex === undefined) {
        this.properties.selectors.add(_selector)

        continue
      }
    }

    for (const _inject of args.injects) {
      if (!isMatchToClass(this.target, _inject.target)) continue

      if (_inject.propertyKey === undefined) {
        if (_inject.parameterIndex === undefined) throw new Error('TODO')

        this.arguments.injects.add(_inject)

        continue
      }

      if (_inject.parameterIndex === undefined) {
        this.properties.injects.add(_inject)

        continue
      }

      throw new Error('TODO')
    }

    for (const _injectableHoisting of args.injectableHoistings) {
      if (!isMatchToClass(this.target, _injectableHoisting.target)) continue

      this.hoisting = _injectableHoisting.propertyKey
    }
  }

  public async toInstance(module: Module) {
    if (this.scope === 'singleton') {
      if (this.#singleton) return this.#singleton

      if (this.virtualizer) {
        this.#singleton = this.virtualizer(module.context)

        return this.#singleton
      }

      const [args, properties] = await Promise.all([
        this.arguments.injects.toArguments(module),
        this.properties.injects.toProperties(module),
      ])

      let target = new this.target!(...args)

      Object.assign(target, properties)

      if (this.hoisting) {
        if (typeof target[this.hoisting] === 'function')
          target = target[this.hoisting]()
        else target = target[this.hoisting]
      }

      this.#singleton = target

      return this.#singleton
    }

    if (!module.context)
      throw new InjectOutOfScopeError(
        `Static injection not allowed for a ${this.scope} scope injectable`,
      )

    if (this.virtualizer) return this.virtualizer(module.context)

    const [args, properties] = await Promise.all([
      this.arguments.toArguments(module),
      this.properties.toProperties(module),
    ])

    const target = new this.target!(...args)

    Object.assign(target, properties)

    if (this.hoisting === undefined) return target

    if (typeof target[this.hoisting] === 'function')
      return target[this.hoisting]()

    return target[this.hoisting]
  }
}
