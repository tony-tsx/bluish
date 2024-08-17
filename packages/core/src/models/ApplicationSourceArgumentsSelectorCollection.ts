import { chain } from '../tools/chain.js'
import { Next } from '../typings/Next.js'
import { ApplicationSourceSelector } from './ApplicationSourceSelector.js'
import { Context } from './Context.js'
import { MetadataSelectorArg } from './MetadataArgsStorage.js'
import { Module } from './Module.js'

function run(
  selector: ApplicationSourceSelector,
  context: Context,
  next: Next,
) {
  return selector._selector.selector(context, next)
}

export class ApplicationSourceArgumentsSelectorCollection extends Map<
  number,
  ApplicationSourceSelector[]
> {
  public add(_selector: MetadataSelectorArg) {
    if (!this.has(_selector.parameterIndex!))
      this.set(_selector.parameterIndex!, [])

    this.get(_selector.parameterIndex!)!.push(
      new ApplicationSourceSelector(_selector),
    )
  }

  public toArguments(module: Module) {
    const args: unknown[] = []

    return Promise.all(
      Array.from(this).map(async ([parameterIndex, selectors]) => {
        const value = await chain(selectors, run)(null, module.context)

        args[parameterIndex] = value
      }),
    ).then(() => args)
  }
}
