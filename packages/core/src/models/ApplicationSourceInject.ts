import { MetadataInjectArg } from './MetadataArgsStorage.js'
import { Module } from './Module.js'

export class ApplicationSourceInject {
  public readonly ref: unknown

  constructor(public readonly _inject: MetadataInjectArg) {
    this.ref =
      typeof this._inject.ref === 'function'
        ? this._inject.ref()
        : this._inject.ref
  }

  public async resolve(module: Module) {
    const injectable = module.find(this._inject.ref)

    const value = await injectable.toInstance(module)

    return value
  }
}
