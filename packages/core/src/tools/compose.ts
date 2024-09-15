import { Middleware } from '../models/Middleware.js'
import { chain } from './chain.js'
import { middlewareExec } from './middlewareExec.js'

export function compose(middlewares: Middleware[]) {
  if (!Array.isArray(middlewares))
    throw new TypeError('Middleware stack must be an array!')

  for (const middleware of middlewares)
    if (typeof middleware !== 'object' || !(middleware instanceof Middleware))
      throw new TypeError('Middleware must be an instance of Middleware!')

  return chain(middlewares, middlewareExec)
}
