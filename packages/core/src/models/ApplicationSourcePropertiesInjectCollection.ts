import { ApplicationInjection } from './ApplicationInjection.js'
import { ApplicationSourceInject } from './ApplicationSourceInject.js'
import { MetadataInjectArg } from './MetadataArgsStorage.js'
import { Module } from './Module.js'

export class ApplicationSourcePropertiesInjectCollection extends Map<
  string | symbol,
  ApplicationSourceInject
> {
  public add(_inject: MetadataInjectArg) {
    this.set(_inject.propertyKey!, new ApplicationSourceInject(_inject))
  }

  public toProperties(
    module: Module,
    properties: Record<string | symbol, unknown> = {},
  ) {
    return Promise.all(
      Array.from(this).map(async ([propertykey, inject]) => {
        const injection = new ApplicationInjection(
          inject,
          module,
          properties[propertykey],
        )

        await module.pipes.run(injection)

        properties[propertykey] = injection.value
      }),
    ).then(() => properties)
  }
}
