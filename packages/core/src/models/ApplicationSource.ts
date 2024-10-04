import { getReflectMetadata } from '../tools/getReflectMetadata.js'
import { isMatchToClass } from '../tools/isMatchToClass.js'
import { Class, Constructable } from '../typings/Class.js'
import { Application } from './Application.js'
import { ApplicationSourceActionCollection } from './ApplicationSourceActionCollection.js'
import { ApplicationSourceArguments } from './ApplicationSourceArguments.js'
import {
  getMetadataArgsStorage,
  MetadataActionArg,
  MetadataArg,
  MetadataControllerArg,
  MetadataInjectArg,
  MetadataInputArg,
  MetadataIsolatedArg,
  MetadataMiddlewareArg,
  MetadataPipeArg,
  MetadataUsableArg,
} from './MetadataArgsStorage.js'
import { ApplicationSourceProperties } from './ApplicationSourceProperties.js'
import { ApplicationSourceMiddlewareCollection } from './ApplicationSourceMiddlewareCollection.js'
import { ApplicationSourcePipeCollection } from './ApplicationSourcePipeCollection.js'
import { Context } from './Context.js'
import { ApplicationSourceMetadata } from './ApplicationSourceMetadata.js'

export class ApplicationSource {
  public readonly target: Constructable

  public readonly isIsolated: boolean

  public readonly actions = new ApplicationSourceActionCollection(this)

  public readonly middlewares: ApplicationSourceMiddlewareCollection

  public readonly pipes: ApplicationSourcePipeCollection

  public readonly static: ApplicationSourceProperties

  public readonly arguments: ApplicationSourceArguments

  public readonly properties: ApplicationSourceProperties

  public readonly metadata = new ApplicationSourceMetadata()

  public is(target: Class | object, strict: boolean) {
    return isMatchToClass(this.target, target, strict)
  }

  constructor(
    public readonly application: Application,
    public readonly _controller: MetadataControllerArg,
  ) {
    this.target = _controller.target

    const isStrictPipes = !(this._controller.inherit?.pipes ?? true)
    const isStrictInput = !(this._controller.inherit?.selectors ?? true)
    const isStrictInjects = !(this._controller.inherit?.injects ?? true)
    const isStrictMetadata = !(this._controller.inherit?.metadata ?? true)
    const isStrictMiddlewares = !(this._controller.inherit?.middlewares ?? true)
    const isStrictUsables = !(this._controller.inherit?.usables ?? true)
    const isStrictActions = !(this._controller.inherit?.actions ?? true)

    const args = getMetadataArgsStorage()

    const paramtypes = getReflectMetadata<unknown[]>(
      'design:paramtypes',
      this.target,
    )

    if (paramtypes) this.metadata.set('design:paramtypes', paramtypes)

    this.isIsolated = args.isolated.some(_isolated => this.is(_isolated, true))

    this.middlewares = new ApplicationSourceMiddlewareCollection(
      !this.isIsolated ? this.application.middlewares : null,
    )
    this.pipes = new ApplicationSourcePipeCollection(
      !this.isIsolated ? this.application.pipes : null,
    )
    this.static = new ApplicationSourceProperties(this.target, this.pipes)
    this.arguments = new ApplicationSourceArguments(
      this.target,
      undefined,
      this.pipes,
    )
    this.properties = new ApplicationSourceProperties(
      this.target.prototype,
      this.pipes,
    )

    if (paramtypes)
      for (const [parameterIndex, paramtype] of paramtypes.entries())
        this.add({
          type: 'inject',
          target: this.target,
          ref: () => paramtype,
          parameterIndex,
        })

    for (const _action of args.actions)
      if (this.is(_action.target, isStrictActions)) this.add(_action)

    for (const _isolated of args.isolated)
      if (this.is(_isolated.target, false)) this.add(_isolated)

    for (const _metadata of args.metadatas)
      if (this.is(_metadata.target, isStrictMetadata)) this.add(_metadata)

    for (const _input of args.inputs)
      if (this.is(_input.target, isStrictInput)) this.add(_input)

    for (const _inject of args.injects)
      if (this.is(_inject.target, isStrictInjects)) this.add(_inject)

    for (const _middleware of args.middlewares)
      if (this.is(_middleware.target, isStrictMiddlewares))
        this.add(_middleware)

    for (const _pipe of getMetadataArgsStorage().pipes)
      if (this.is(_pipe.target, isStrictPipes)) this.add(_pipe)

    for (const _usable of args.usables)
      if (this.is(_usable.target, isStrictUsables)) this.add(_usable)
  }

  public add(
    _arg:
      | MetadataArg
      | MetadataPipeArg
      | MetadataActionArg
      | MetadataMiddlewareArg
      | MetadataUsableArg
      | MetadataIsolatedArg
      | MetadataInjectArg
      | MetadataInputArg,
  ) {
    if (!this.is(_arg.target, false)) throw new TypeError('Invalid target')

    if (_arg.type === 'action') return void this.actions.add(_arg)

    if (_arg.propertyKey !== undefined) {
      const action = this.actions.findBy(_arg.target, _arg.propertyKey)

      if (action) return void action.add(_arg)

      if (_arg.type === 'middleware')
        throw new TypeError(
          'Metadata arg type middleware not allowed in source property',
        )

      if (_arg.type === 'isolated')
        throw new TypeError(
          'Metadata arg type isolated not allowed in source property',
        )

      if (typeof _arg.target === 'function') return void this.static.add(_arg)

      return void this.properties.add(_arg)
    }

    // @ts-expect-error: TODO
    if (_arg.type === 'isolated') return void (this.isIsolated = true)

    if (_arg.parameterIndex !== undefined) return void this.arguments.add(_arg)

    if (_arg.type === 'inject') throw new TypeError('Inject is malformed')

    if (_arg.type === 'input') throw new TypeError('Input is malformed')

    switch (_arg.type) {
      case 'usable':
        return void _arg.usable.use(this)
      case 'middleware':
        return void this.middlewares.add(_arg)
      case 'metadata':
        return void this.metadata.add(_arg)
      case 'pipe':
        return void this.pipes.add(_arg)
      default:
        throw new TypeError(
          // @ts-expect-error: unkonwn metadata arg type
          `Unkknown metadata arg type in application source: ${_arg.type}`,
        )
    }
  }

  public async call(context: Context) {
    const target = new this.target!(
      ...(await this.arguments.call(this.target.prototype, context.module)),
    )

    Object.assign(target, await this.properties.call(target, context.module))

    return target
  }
}
