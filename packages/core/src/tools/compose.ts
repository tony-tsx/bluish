import { Context } from '../models/Context.js'
import { Middleware } from '../models/Middleware.js'
import { Next } from '../typings/Next.js'

export function compose(middlewares: Middleware[]) {
  if (!Array.isArray(middlewares))
    throw new TypeError('Middleware stack must be an array!')

  for (const middleware of middlewares)
    if (typeof middleware !== 'object' || !(middleware instanceof Middleware))
      throw new TypeError('Middleware must be an instance of Middleware!')

  return (context: Context, next: Next) => {
    let index: number = -1

    function dispatch(i: number): Promise<unknown> {
      if (i <= index) throw new Error('next() called multiple times')

      index = i

      const middleware = middlewares[i]

      if (!middleware)
        try {
          return Promise.resolve(next())
        } catch (err) {
          return Promise.reject(err)
        }

      if (!middleware.context.some(contructor => context instanceof contructor))
        try {
          return Promise.resolve(dispatch(i + 1))
        } catch (err) {
          return Promise.reject(err)
        }

      try {
        return Promise.resolve(
          middleware.handle(context, dispatch.bind(null, i + 1)),
        )
      } catch (err) {
        return Promise.reject(err)
      }
    }

    return dispatch(0)
  }
}
