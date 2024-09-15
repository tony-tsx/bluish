import { Next } from '../decorators/Next.js'
import { Context } from '../models/Context.js'
import { Middleware } from '../models/Middleware.js'

export function middlewareExec(
  middleware: Middleware<Context>,
  context: Context,
  next: Next,
) {
  if (!middleware.context.some(contructor => context instanceof contructor))
    return next()

  context.next = next

  return middleware.run(context, next)
}
