import { getReflectMetadata } from '../tools/getReflectMetadata.js'
import { isMatchToAction } from '../tools/isMatchToAction.js'
import { Class } from '../typings/Class.js'
import { ApplicationSource } from './ApplicationSource.js'
import { ApplicationSourceArguments } from './ApplicationSourceArguments.js'
import { ApplicationSourceMetadata } from './ApplicationSourceMetadata.js'
import { ApplicationSourceMiddlewareCollection } from './ApplicationSourceMiddlewareCollection.js'
import { ApplicationSourcePipeCollection } from './ApplicationSourcePipeCollection.js'
import { Context } from './Context.js'
import {
  getMetadataArgsStorage,
  MetadataActionArg,
  MetadataArg,
  MetadataInjectArg,
  MetadataInputArg,
  MetadataIsolatedArg,
  MetadataMiddlewareArg,
  MetadataPipeArg,
  MetadataUsableArg,
} from './MetadataArgsStorage.js'
import { Middleware } from './Middleware.js'

export class ApplicationSourceAction {
  public readonly target: Class | object

  public readonly context: Class<Context>

  public readonly propertyKey: undefined | string | symbol

  public readonly isIsolated: boolean

  public readonly arguments: ApplicationSourceArguments

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

  public of(context: Class<Context>) {
    return context === this.context || context.prototype instanceof this.context
  }

  constructor(
    public readonly controller: ApplicationSource,
    public readonly _action: MetadataActionArg,
  ) {
    this.target = _action.target
    this.context = _action.context ?? Context
    this.propertyKey = _action.propertyKey

    const args = getMetadataArgsStorage()

    this.isIsolated = args.isolated.some(_isolated => this.is(_isolated))

    this.pipes = new ApplicationSourcePipeCollection(
      !this.isIsolated ? this.controller.pipes : null,
    )
    this.middlewares = new ApplicationSourceMiddlewareCollection(
      !this.isIsolated ? this.controller.middlewares : null,
    )
    this.arguments = new ApplicationSourceArguments(
      this.target,
      this.propertyKey,
      this.pipes,
    )

    if (!Array.isArray(this._action.metadata))
      this.metadata.define(this._action.metadata)
    else if (this._action.metadata)
      for (const entry of this._action.metadata) this.metadata.define(entry)

    if (_action.virtualizer?.refs)
      for (const [parameterIndex, ref] of _action.virtualizer.refs.entries())
        this.arguments.add({
          ref: () => ref,
          type: 'inject',
          target: _action.virtualizer,
          parameterIndex,
        })

    if (!this.propertyKey) return this

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
        this.arguments.add({
          type: 'inject',
          target: this.target,
          parameterIndex,
          propertyKey: this.propertyKey,
          ref: () => type,
        })

      this.metadata.set('design:paramtypes', paramtypes)
    }

    if (returntype) this.metadata.set('design:returntype', returntype)
  }

  public add(
    _arg:
      | MetadataIsolatedArg
      | MetadataMiddlewareArg
      | MetadataPipeArg
      | MetadataUsableArg
      | MetadataArg
      | MetadataInjectArg
      | MetadataInputArg,
  ) {
    if (!this.is(_arg))
      throw new TypeError(`metadata arg is not match to action`)

    // @ts-expect-error: TODO
    if (_arg.type === 'isolated') return void (this.isIsolated = true)

    if (_arg.parameterIndex !== undefined) return void this.arguments.add(_arg)

    switch (_arg.type) {
      case 'usable':
        return void _arg.usable.use(this)
      case 'inject':
        return void this.arguments.add(_arg)
      case 'input':
        return void this.arguments.add(_arg)
      case 'middleware':
        return void this.middlewares.add(_arg)
      case 'metadata':
        return void this.metadata.add(_arg)
      case 'pipe':
        return void this.pipes.add(_arg)
      default:
        throw new TypeError(
          // @ts-expect-error: unkonwn metadata arg type
          `Unkknown metadata arg type in application source action: ${_arg.type}`,
        )
    }
  }

  public async _constructor() {
    if (this._action.middlewares)
      for (const middlewares of this._action.middlewares) {
        if (typeof middlewares === 'undefined') continue

        for (const middleware of middlewares)
          this.middlewares.add(Middleware.from(middleware))
      }

    await this._action.constructor?.(this, this._action.options)
  }

  private async __run(context: Context, target: any) {
    Object.defineProperty(context, 'target', {
      value: target,
      writable: false,
      enumerable: false,
      configurable: false,
    })

    return this.arguments.mount(target, context.module, args => {
      Object.defineProperty(context, 'arguments', {
        value: Object.freeze(args),
        enumerable: true,
        writable: false,
        configurable: false,
      })

      return target[this.propertyKey!](...args)
    })
  }

  private async _run(context: Context) {
    const target: any = this.target

    if (!this._action.propertyKey)
      return this.arguments.mount(null, context.module, args => {
        Object.defineProperty(context, 'arguments', {
          value: Object.freeze(args),
          enumerable: true,
          writable: false,
          configurable: false,
        })

        return this._action.virtualizer!.handle!(...args)
      })

    if (typeof target === 'object')
      return this.controller.construct(context, target => {
        return this.__run(context, target)
      })

    return this.__run(context, target)
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

          this._run(context).then(value => {
            Object.defineProperty(context, 'return', {
              value,
              writable: false,
              enumerable: false,
              configurable: false,
            })
            resolve(value)
          }, reject)
        }),
    )
  }
}
