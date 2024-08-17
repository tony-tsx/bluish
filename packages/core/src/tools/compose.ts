import { Next } from '../decorators/Next.js'
import { Context } from '../models/Context.js'
import { Middleware } from '../models/Middleware.js'
import { chain } from './chain.js'

function fn(middleware: Middleware, context: Context, next: Next) {
  if (!middleware.context.some(contructor => context instanceof contructor))
    return next()

  return middleware.run(context, next)
}

export function compose(middlewares: Middleware[]) {
  if (!Array.isArray(middlewares))
    throw new TypeError('Middleware stack must be an array!')

  for (const middleware of middlewares)
    if (typeof middleware !== 'object' || !(middleware instanceof Middleware))
      throw new TypeError('Middleware must be an instance of Middleware!')

  return chain(middlewares, fn)
}
