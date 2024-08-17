import { ApplicationSourceSelector } from './ApplicationSourceSelector.js'
import { MetadataSelectorArg } from './MetadataArgsStorage.js'
import { Next } from '../typings/Next.js'
import { Context } from './Context.js'
import { Module } from './Module.js'
import { chain } from '../tools/chain.js'

function run(
  selector: ApplicationSourceSelector,
  context: Context,
  next: Next,
) {
  return selector._selector.selector(context, next)
}

export class ApplicationSourcePropertiesSelectorCollection extends Map<
  string | symbol,
  ApplicationSourceSelector[]
> {
  public add(_selector: MetadataSelectorArg) {
    if (!this.has(_selector.propertyKey!)) this.set(_selector.propertyKey!, [])

    this.get(_selector.propertyKey!)!.push(
      new ApplicationSourceSelector(_selector),
    )
  }

  public toProperties(module: Module) {
    const properties: Record<string | symbol, unknown> = {}

    return Promise.all(
      Array.from(this).map(async ([propertyKey, selectors]) => {
        properties[propertyKey] = await chain(selectors, run)(
          null,
          module.context,
        )
      }),
    ).then(() => properties)
  }
}
