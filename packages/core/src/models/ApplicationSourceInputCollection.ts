import { ApplicationSourceInput } from './ApplicationSourceInput.js'
import { MetadataInputArg } from './MetadataArgsStorage.js'
import { chain } from '../tools/chain.js'
import { Next } from '../decorators/Next.js'
import { PipeInput } from '../decorators/UsePipe.js'

function run(
  this: unknown,
  input: ApplicationSourceInput,
  arg: PipeInput,
  next: Next,
) {
  if (input.is(arg.module.context)) return input.call(this, arg, next)

  return next()
}

export class ApplicationSourceInputCollection extends Set<ApplicationSourceInput> {
  #fn: null | ((next: Next | null, input: PipeInput) => Promise<unknown>) = null

  public override add(_selector: MetadataInputArg | ApplicationSourceInput) {
    if (_selector instanceof ApplicationSourceInput) return super.add(_selector)

    return super.add(new ApplicationSourceInput(_selector))
  }

  public async call<TThis = unknown>(self: TThis, arg: PipeInput, next: Next) {
    if (!this.#fn) this.#fn = chain(Array.from(this), run)

    return this.#fn.call(self, next, arg)
  }
}
