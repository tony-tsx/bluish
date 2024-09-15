import { MetadataInjectArg } from './MetadataArgsStorage.js'

export class ApplicationSourceInject {
  public readonly ref: any

  constructor(public readonly _inject: MetadataInjectArg) {
    this.ref =
      typeof this._inject.ref === 'function'
        ? this._inject.ref()
        : this._inject.ref
  }
}
