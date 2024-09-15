import { ApplicationSourceInput } from './ApplicationSourceInput.js'
import { MetadataInputArg } from './MetadataArgsStorage.js'
import { Context } from './Context.js'
import { chain } from '../tools/chain.js'
import { Next } from '../decorators/Next.js'

function run(input: ApplicationSourceInput, context: Context, next: Next) {
  if (input.is(context)) return input.get(context, next)

  return next()
}

export class ApplicationSourceInputCollection extends Set<ApplicationSourceInput> {
  #fn: null | ((context: Context) => Promise<unknown>) = null

  public override add(_selector: MetadataInputArg | ApplicationSourceInput) {
    if (_selector instanceof ApplicationSourceInput) return super.add(_selector)

    return super.add(new ApplicationSourceInput(_selector))
  }

  public async get(context: Context) {
    if (!this.#fn) this.#fn = chain(Array.from(this), run).bind(null, null)

    return this.#fn(context)
  }
}
