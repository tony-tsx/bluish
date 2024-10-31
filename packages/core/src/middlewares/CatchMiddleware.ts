import { Context } from '../models/Context.js'
import { Middleware } from '../models/Middleware.js'
import { Class } from '../typings/Class.js'
import { CatchHandler } from '../decorators/Catch.js'

export class CatchMiddleware<
  TContext extends Context,
> extends Middleware<TContext> {
  constructor(run: CatchHandler<TContext>)
  constructor(
    context: Class<TContext> | Class<TContext>[],
    handle: CatchHandler<TContext>,
  )
  constructor(
    runOrContext: CatchHandler<TContext> | Class<TContext> | Class<TContext>[],
    maybeHandle?: CatchHandler<TContext>,
  )
  constructor(
    runOrContext: CatchHandler<TContext> | Class<TContext> | Class<TContext>[],
    maybeHandle?: CatchHandler<TContext>,
  ) {
    const context =
      typeof maybeHandle === 'function'
        ? (runOrContext as Class<TContext> | Class<TContext>[])
        : (Context as unknown as Class<TContext>)
    const handle =
      typeof maybeHandle === 'function'
        ? maybeHandle
        : (runOrContext as CatchHandler<TContext>)

    super(context, async (context, next) =>
      next().catch(error => handle(error, context)),
    )
  }
}
