import { Middleware } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export interface CorsConfiguration {
  origin?:
    | string
    | RegExp
    | (string | RegExp)[]
    | ((context: HttpContext) => string | RegExp | (string | RegExp)[])
  credentials?: boolean
  exposedHeaders?: string | string[]
  allowHeaders?: string | string[]
  allowMethods?: string | string[]
  maxAge?: number | string
  preflightContinue?: boolean
}

export function cors({
  origin: _origin = '*',
  credentials,
  exposedHeaders,
  allowHeaders,
  allowMethods,
  maxAge,
  preflightContinue,
}: CorsConfiguration = {}) {
  return Middleware.from(HttpContext, (context, next) => {
    const origin = typeof _origin === 'function' ? _origin(context) : _origin

    if (typeof origin === 'string') {
      context.response.headers['Access-Control-Allow-Origin'] = origin

      if (origin !== '*') context.response.headers['Vary'] = 'Origin'
    } else {
      const isAllowed = (Array.isArray(origin) ? origin : [origin]).some(
        origin => {
          if (typeof origin === 'string')
            return origin === context.request.headers['origin']

          return origin.test(context.request.headers['origin'] as string)
        },
      )

      context.response.headers['Access-Control-Allow-Origin'] = isAllowed
        ? (context.request.headers['origin'] as string)
        : 'false'
      context.response.headers['Vary'] = 'Origin'
    }

    if (credentials === true)
      context.response.headers['Access-Control-Allow-Credentials'] = 'true'

    if (exposedHeaders)
      context.response.headers['Access-Control-Expose-Headers'] = exposedHeaders

    if (context.request.method !== 'OPTIONS') return next()

    if (allowMethods)
      context.response.headers['Access-Control-Allow-Methods'] = allowMethods

    if (allowHeaders)
      context.response.headers['Access-Control-Allow-Headers'] = allowHeaders

    if (maxAge)
      context.response.headers['Access-Control-Max-Age'] = maxAge.toString()

    if (preflightContinue) return next()

    context.response.status = 204
    context.response.headers['Content-Length'] = '0'

    return
  })
}
