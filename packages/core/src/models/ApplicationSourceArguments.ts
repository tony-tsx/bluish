import { Next } from '../decorators/Next.js'
import { chain } from '../tools/chain.js'
import { Class } from '../typings/Class.js'
import { ApplicationSourceArgument } from './ApplicationSourceArgument.js'
import { ApplicationSourcePipeCollection } from './ApplicationSourcePipeCollection.js'
import {
  MetadataArg,
  MetadataInjectArg,
  MetadataInputArg,
  MetadataPipeArg,
  MetadataUsableArg,
} from './MetadataArgsStorage.js'
import { Module } from './Module.js'

function run(
  this: any,
  [parameterIndex, argument]: [number, ApplicationSourceArgument],
  module: Module,
  args: any[],
  next: Next,
) {
  return argument.mount(this, module, async value => {
    args[parameterIndex] = value

    const normalize = Promise.resolve(value).then(value => {
      args[parameterIndex] = value
    })

    const [, data] = await Promise.all([normalize, next()])

    return data
  })
}

export class ApplicationSourceArguments {
  #arguments = new Map<number, ApplicationSourceArgument>()
  #fn!: (
    this: any,
    next: Next | null,
    module: Module,
    args: any[],
  ) => Promise<unknown>

  public get length() {
    return this.#arguments.size
  }

  constructor(
    public readonly target: undefined | Class | object,
    public readonly propertyKey: undefined | string | symbol,
    public readonly parent: ApplicationSourcePipeCollection | null,
  ) {}

  public get(parameterIndex: number) {
    return this.#arguments.get(parameterIndex)
  }

  #get(parameterIndex: number) {
    if (!this.#arguments.has(parameterIndex))
      this.#arguments.set(
        parameterIndex,
        new ApplicationSourceArgument(
          this.target,
          this.propertyKey,
          parameterIndex,
          this.parent,
        ),
      )

    return this.#arguments.get(parameterIndex)!
  }

  public add(
    _arg:
      | MetadataInputArg
      | MetadataPipeArg
      | MetadataInjectArg
      | MetadataArg
      | MetadataUsableArg,
  ) {
    if (_arg.parameterIndex === undefined) throw new TypeError('TODO')

    this.#get(_arg.parameterIndex).add(_arg)
  }

  public mount<TThis>(
    target: TThis,
    module: Module,
    next: (args: unknown[]) => unknown,
  ) {
    if (!this.#fn) this.#fn = chain(Array.from(this.#arguments), run)

    const args: any[] = []

    return this.#fn.call(
      target,
      () => Promise.all(args).then(args => next(args)),
      module,
      args,
    )
  }
}
