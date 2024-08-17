import { ApplicationInjection } from './ApplicationInjection.js'
import { ApplicationSourceInject } from './ApplicationSourceInject.js'
import { MetadataInjectArg } from './MetadataArgsStorage.js'
import { Module } from './Module.js'

export class ApplicationSourceArgumentsInjectCollection extends Map<
  number,
  ApplicationSourceInject
> {
  public add(_inject: MetadataInjectArg) {
    this.set(_inject.parameterIndex!, new ApplicationSourceInject(_inject))
  }

  public toArguments(module: Module, args: unknown[] = []) {
    return Promise.all(
      Array.from(this).map(async ([parameterIndex, inject]) => {
        const injection = new ApplicationInjection(
          inject,
          module,
          args[parameterIndex],
        )

        await module.pipes.run(injection)

        args[parameterIndex] = injection.value
      }),
    ).then(() => args)
  }
}
