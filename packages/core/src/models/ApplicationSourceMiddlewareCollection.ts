import { chain } from '../tools/chain.js'
import { Next } from '../typings/Next.js'
import { Context } from './Context.js'
import { MetadataMiddlewareArg } from './MetadataArgsStorage.js'
import { Middleware } from './Middleware.js'

function run(middleware: Middleware, context: Context, next: Next) {
  if (!middleware.context.some(_context => context instanceof _context))
    return next()

  return middleware.run(context, next)
}

export class ApplicationSourceMiddlewareCollection extends Set<Middleware> {
  readonly #parent: ApplicationSourceMiddlewareCollection | null

  #run!: (next: Next, context: Context) => Promise<unknown>

  constructor(parent: ApplicationSourceMiddlewareCollection | null) {
    super()
    this.#parent = parent
  }

  private _flat(): Middleware[] {
    if (this.#parent) return [...this.#parent._flat(), ...this]

    return [...this]
  }

  public override add(_middleware: MetadataMiddlewareArg | Middleware) {
    if (_middleware instanceof Middleware) return super.add(_middleware)

    return super.add(Middleware.from(_middleware.middleware))
  }

  public async run(context: Context, next: Next) {
    if (!this.#run) this.#run = chain(this._flat(), run)

    return await this.#run(next, context)
  }
}
