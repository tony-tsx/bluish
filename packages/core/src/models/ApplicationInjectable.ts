import { isMatchToClass } from '../tools/isMatchToClass.js'
import { Constructable } from '../typings/Class.js'
import { Application } from './Application.js'
import { ApplicationSourceArguments } from './ApplicationSourceArguments.js'
import { ApplicationSourceProperties } from './ApplicationSourceProperties.js'
import {
  getMetadataArgsStorage,
  MetadataInjectableArg,
} from './MetadataArgsStorage.js'
import { Module } from './Module.js'

export class ApplicationInjectable {
  public readonly ref: any

  public readonly target: Constructable | undefined

  public readonly scope: 'singleton' | 'transient' | 'context'

  public readonly hoisting: string | symbol | undefined

  public readonly arguments: ApplicationSourceArguments

  public readonly properties!: ApplicationSourceProperties

  constructor(
    public readonly application: Application,
    public readonly _injectable: MetadataInjectableArg,
  ) {
    this.ref = this._injectable.ref
    this.target = this._injectable.target
    this.scope = this._injectable.scope

    this.arguments = new ApplicationSourceArguments(
      undefined,
      undefined,
      application.pipes,
    )

    const args = getMetadataArgsStorage()

    for (const [
      parameterIndex,
      ref,
    ] of _injectable.virtualizer?.refs?.entries() ?? [])
      this.arguments.add({
        type: 'inject',
        target: {},
        ref: () => ref,
        parameterIndex,
      })

    if (!this.target) return this

    this.properties = new ApplicationSourceProperties(
      this.target.prototype,
      null,
    )

    for (const _input of args.inputs) {
      if (!isMatchToClass(this.target, _input.target, false)) continue

      if (_input.propertyKey === undefined) {
        if (_input.parameterIndex === undefined) throw new Error('TODO')

        this.arguments.add(_input)

        continue
      }

      if (_input.parameterIndex === undefined) {
        this.properties.add(_input)

        continue
      }
    }

    for (const _inject of args.injects) {
      if (!isMatchToClass(this.target, _inject.target, false)) continue

      if (_inject.propertyKey === undefined) {
        if (_inject.parameterIndex === undefined) throw new Error('TODO')

        this.arguments.add(_inject)

        continue
      }

      if (_inject.parameterIndex === undefined) {
        this.properties.add(_inject)

        continue
      }

      throw new Error('TODO')
    }

    for (const _injectableHoisting of args.injectableHoistings) {
      if (!isMatchToClass(this.target, _injectableHoisting.target, false))
        continue

      this.hoisting = _injectableHoisting.propertyKey
    }
  }

  public async to(module: Module) {
    if (this._injectable.virtualizer) {
      const args = await this.arguments.call(null, module)

      return this._injectable.virtualizer.handle(...args)
    }

    let target = new this.target!(
      ...(await this.arguments.call(this.target!.prototype, module)),
    )

    Object.assign(target, await this.properties.call(target, module))

    if (this.hoisting) {
      if (typeof target[this.hoisting] === 'function')
        target = target[this.hoisting]()
      else target = target[this.hoisting]
    }

    return target
  }
}
