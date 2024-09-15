import { Next } from '../decorators/Next.js'
import { compose } from '../tools/compose.js'
import { Context } from './Context.js'
import { MetadataMiddlewareArg } from './MetadataArgsStorage.js'
import { Middleware } from './Middleware.js'

export class ApplicationSourceMiddlewareCollection {
  #middlewares = new Set<Middleware>()

  #run!: (next: Next, context: Context) => Promise<unknown>

  public get length() {
    return this.#middlewares.size
  }

  constructor(
    public readonly parent: ApplicationSourceMiddlewareCollection | null,
  ) {}

  #flat(): Middleware[] {
    if (this.parent) return [...this.parent.#flat(), ...this.#middlewares]

    return [...this.#middlewares]
  }

  public add(_middleware: MetadataMiddlewareArg | Middleware) {
    if (_middleware instanceof Middleware) this.#middlewares.add(_middleware)
    else this.#middlewares.add(Middleware.from(_middleware.middleware))
  }

  public async run(context: Context, next: Next) {
    if (!this.#run) this.#run = compose(this.#flat())

    return await this.#run(next, context)
  }
}
