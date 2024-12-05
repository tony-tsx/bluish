import { ApplicationSourceMetadata } from './ApplicationSourceMetadata.js'
import { ApplicationSourcePipeCollection } from './ApplicationSourcePipeCollection.js'
import { ApplicationSourceInputCollection } from './ApplicationSourceInputCollection.js'
import { PipeInput } from '../decorators/UsePipe.js'
import { ApplicationSourceInject } from './ApplicationSourceInject.js'
import { Module } from './Module.js'
import { Class } from '../typings/Class.js'
import { getReflectMetadata } from '../tools/getReflectMetadata.js'
import {
  MetadataInputArg,
  MetadataPipeArg,
  MetadataInjectArg,
  MetadataArg,
  MetadataUsableArg,
} from './MetadataArgsStorage.js'

export class ApplicationSourceProperty {
  public inject: ApplicationSourceInject | null = null

  public readonly input!: ApplicationSourceInputCollection

  public readonly pipes: ApplicationSourcePipeCollection

  public readonly metadata = new ApplicationSourceMetadata()

  public readonly dependencies = new Set<string | symbol>()

  constructor(
    public readonly target: Class | object,
    public readonly propertyKey: string | symbol,
    public readonly parent: ApplicationSourcePipeCollection | null,
  ) {
    this.input = new ApplicationSourceInputCollection()

    this.pipes = new ApplicationSourcePipeCollection(parent)

    const designtype = getReflectMetadata(
      'design:type',
      this.target,
      this.propertyKey,
    )

    if (designtype) this.metadata.set('design:type', designtype)
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
        _arg.deps?.forEach(dependecy => this.dependencies.add(dependecy))

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

    return this.input.call(target, arg, async () => {
      await this.pipes.run(arg)

      return next(arg.value)
    })
  }
}
