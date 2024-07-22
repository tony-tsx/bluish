import { Middleware } from './Middleware.js'
import { Next } from '../typings/Next.js'
import { Context } from './Context.js'
import { Class } from '../typings/Class.js'
import { compose } from '../tools/compose.js'

export class MiddlewareCompose<
  TContext extends Context,
> extends Middleware<TContext> {
  public context: Class<TContext>[]

  public handle: (context: TContext, next: Next) => unknown

  public constructor(public readonly middlewares: Middleware<TContext>[]) {
    super()

    this.context = Array.from(
      new Set(middlewares.flatMap(middleware => middleware.context)),
    )

    this.handle = compose(middlewares)
  }
}
