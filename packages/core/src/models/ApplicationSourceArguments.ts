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

export class ApplicationSourceArguments {
  #arguments = new Map<number, ApplicationSourceArgument>()

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

  public async to(module: Module) {
    const args: unknown[] = []

    return Promise.all(
      Array.from(this.#arguments).map(async ([parameterIndex, argument]) => {
        args[parameterIndex] = await argument.to(module)
      }),
    ).then(() => args)
  }
}
