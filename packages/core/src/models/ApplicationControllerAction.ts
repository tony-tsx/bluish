import { getReflectMetadata } from '../tools/getReflectMetadata.js'
import { isMatchToAction } from '../tools/isMatchToAction.js'
import { Class } from '../typings/Class.js'
import { ApplicationController } from './ApplicationController.js'
import { ApplicationSourceArguments } from './ApplicationSourceArguments.js'
import { ApplicationSourceMetadata } from './ApplicationSourceMetadata.js'
import { ApplicationSourceMiddlewareCollection } from './ApplicationSourceMiddlewareCollection.js'
import { ApplicationSourcePipeCollection } from './ApplicationSourcePipeCollection.js'
import { Context } from './Context.js'
import {
  getMetadataArgsStorage,
  MetadataActionArg,
} from './MetadataArgsStorage.js'

export class ApplicationControllerAction {
  public readonly target: Class | object

  public readonly context: Class<Context>

  public readonly propertyKey: undefined | string | symbol

  public readonly isIsolated: boolean

  public readonly arguments = new ApplicationSourceArguments()

  public readonly middlewares: ApplicationSourceMiddlewareCollection

  public readonly pipes: ApplicationSourcePipeCollection

  public readonly metadata = new ApplicationSourceMetadata()

  public get isStatic() {
    return typeof this.target === 'function'
  }

  public is(_test: {
    target: Class | object
    propertyKey?: undefined | string | symbol
  }) {
    if (_test.propertyKey === undefined) return false

    return isMatchToAction(this, _test.target, _test.propertyKey)
  }

  constructor(
    public readonly controller: ApplicationController,
    public readonly _action: MetadataActionArg,
  ) {
    this.target = _action.target
    this.context = _action.context ?? Context
    this.propertyKey = _action.propertyKey

    const args = getMetadataArgsStorage()

    this.isIsolated = args.isolated.some(_isolated => this.is(_isolated))

    this.middlewares = new ApplicationSourceMiddlewareCollection(
      !this.isIsolated ? this.controller.middlewares : null,
    )
    this.pipes = new ApplicationSourcePipeCollection(
      !this.isIsolated ? this.controller.pipes : null,
    )

    if (this.propertyKey === undefined) return this

    const paramtypes = getReflectMetadata<unknown[]>(
      'design:paramtypes',
      this.target,
      this.propertyKey,
    )

    const returntype = getReflectMetadata(
      'design:returntype',
      this.target,
      this.propertyKey,
    )

    if (paramtypes) {
      for (const [parameterIndex, type] of paramtypes.entries())
        this.arguments.injects.add({
          target: this.target,
          parameterIndex,
          propertyKey: this.propertyKey,
          ref: () => type,
        })

      this.metadata.set('design:paramtypes', paramtypes)
    }

    if (returntype) this.metadata.set('design:returntype', returntype)

    for (const _metadata of args.metadatas) {
      if (!this.is(_metadata)) continue

      this.metadata.add(_metadata)
    }

    for (const _selector of args.selectors) {
      if (_selector.parameterIndex === undefined) continue

      if (!this.is(_selector)) continue

      this.arguments.selectors.add(_selector)
    }

    for (const _inject of args.injects) {
      if (_inject.propertyKey === undefined) continue

      if (_inject.parameterIndex === undefined) continue

      if (!this.is(_inject)) continue

      this.arguments.injects.add(_inject)
    }

    for (const _middleware of args.middlewares)
      if (this.is(_middleware)) this.middlewares.add(_middleware)

    for (const _pipe of args.pipes) {
      if (!_pipe.propertyKey) continue

      if (!this.is(_pipe)) continue

      this.pipes.add(_pipe)
    }
  }

  public async _run(context: Context) {
    let target: any = this.target

    if (!this._action.propertyKey) return this._action.virtualizer!(context)

    if (typeof target === 'object')
      target = await this.controller.toInstance(context)

    Object.defineProperty(context, 'target', {
      value: target,
      writable: false,
      enumerable: false,
      configurable: false,
    })

    const args = await this.arguments.toArguments(context.module)

    const value = await target[this.propertyKey!](...args)

    Object.defineProperty(context, 'return', {
      value,
      writable: false,
      enumerable: false,
      configurable: false,
    })
  }

  public run(context: Context) {
    if (!(context instanceof this.context))
      throw new TypeError('Invalid context')

    Object.defineProperty(context, 'action', {
      value: this,
      writable: false,
      enumerable: false,
      configurable: false,
    })

    return this.middlewares.run(
      context,
      async () =>
        new Promise<unknown>((resolve, reject) => {
          context.next = (error?: unknown) => {
            if (error) return reject(error)

            return resolve(undefined)
          }

          this._run(context).then(resolve, reject)
        }),
    )
  }
}
