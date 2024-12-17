import { PipeInput } from '../decorators/UsePipe.js'
import { getReflectMetadata } from '../tools/getReflectMetadata.js'
import { Class } from '../typings/Class.js'
import { ApplicationSourceInject } from './ApplicationSourceInject.js'
import { ApplicationSourceInputCollection } from './ApplicationSourceInputCollection.js'
import { ApplicationSourceMetadata } from './ApplicationSourceMetadata.js'
import { ApplicationSourcePipeCollection } from './ApplicationSourcePipeCollection.js'
import {
  MetadataArg,
  MetadataInjectArg,
  MetadataInputArg,
  MetadataPipeArg,
  MetadataUsableArg,
} from './MetadataArgsStorage.js'
import { Module } from './Module.js'

export class ApplicationSourceArgument {
  public inject: ApplicationSourceInject | null = null

  public readonly input = new ApplicationSourceInputCollection()

  public readonly pipes: ApplicationSourcePipeCollection

  public readonly metadata = new ApplicationSourceMetadata()

  constructor(
    public readonly target: undefined | Class | object,
    public readonly propertyKey: undefined | string | symbol,
    public readonly parameterIndex: number,
    public parent: ApplicationSourcePipeCollection | null,
  ) {
    this.pipes = new ApplicationSourcePipeCollection(parent)

    if (!this.target) return this

    const paramtypes = getReflectMetadata<unknown[]>(
      'design:paramtypes',
      this.target,
      this.propertyKey,
    )

    if (paramtypes) {
      const designtype = paramtypes[this.parameterIndex]

      if (designtype) this.metadata.set('design:type', designtype)
    }
  }

  public add(
    _arg:
      | MetadataInputArg
      | MetadataPipeArg
      | MetadataInjectArg
      | MetadataArg
      | MetadataUsableArg,
  ) {
    switch (_arg.type) {
      case 'usable':
        return void _arg.usable.use(this)
      case 'inject':
        this.inject = new ApplicationSourceInject(_arg)
        return void 0
      case 'input':
        this.input.add(_arg)
        return void 0
      case 'pipe':
        this.pipes.add(_arg)
        return void 0
      case 'metadata':
        this.metadata.add(_arg)
        return void 0
      default:
        throw new TypeError(
          // @ts-expect-error: unkonwn metadata arg type
          `Unkknown metadata arg type in application source property: ${_arg.type}`,
        )
    }
  }

  public async mount<TThis>(
    target: TThis,
    module: Module,
    next: (value: unknown) => unknown,
  ) {
    const arg: PipeInput = {
      this: target,
      target: this,
      module,
      metadata: this.metadata,
      value: undefined,
      inject: null,
    }

    if (this.inject) arg.inject = this.inject.ref

    return this.input.call(target, arg, async () =>
      this.pipes.run(arg, async () => next(arg.value)),
    )
  }
}
