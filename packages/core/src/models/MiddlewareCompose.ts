import { AnyMiddleware, Middleware } from './Middleware.js'
import { Next } from '../typings/Next.js'
import { Context } from './Context.js'
import { Class } from '../typings/Class.js'
import { compose } from '../tools/compose.js'

export class MiddlewareCompose<
  TContext extends Context,
> extends Middleware<TContext> {
  public context: Class<TContext>[]

  public run: (context: TContext, next: Next) => unknown

  public readonly middlewares: Middleware<TContext>[]

  public constructor(middlewares: AnyMiddleware<TContext>[]) {
    super()

    this.middlewares = middlewares.map(middleware =>
      Middleware.from<TContext>(middleware),
    )

    this.context = Array.from(
      new Set(this.middlewares.flatMap(middleware => middleware.context)),
    )

    const fn = compose(this.middlewares)

    this.run = (context, next) => fn(next, context)
  }
}
