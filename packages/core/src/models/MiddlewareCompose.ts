import { AnyMiddleware, Middleware } from './Middleware.js'
import { Context } from './Context.js'
import { compose } from '../tools/compose.js'
import { Class } from '../typings/Class.js'

export class MiddlewareCompose<
  TContext extends Context,
> extends Middleware<TContext> {
  public constructor(_middlewares: AnyMiddleware<TContext>[])
  public constructor(_middlewares: AnyMiddleware<Context>[]) {
    const middlewares = _middlewares.map(_middleware =>
      Middleware.from(_middleware),
    )
    const fn = compose(middlewares)
    const context = Array.from(
      new Set(middlewares.flatMap(middleware => middleware.context)),
    ) as Class<TContext>[]

    super(context, (context, next) => fn(next, context))
  }
}
