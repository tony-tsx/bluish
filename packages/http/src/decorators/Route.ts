import { Action, Class, Metadata } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'
import { Path } from './Path.js'
import { Accept } from './Accept.js'

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
  | 'CONNECT'
  | 'TRACE'

export function Route(
  method: HttpMethod | HttpMethod[],
  route?: string | string[],
  accept?: string,
) {
  const methods = Array.isArray(method) ? method : [method]

  return (target: Class | object, propertyKey: string | symbol) => {
    Action(HttpContext, {
      middlewares: [
        async (context, next) => {
          const result = await next()
          const body = JSON.stringify(result)

          context.response.status = 200
          ;(context.response.headers['Content-Type'] = 'application/json'),
            (context.response.headers['Content-Length'] =
              body.length.toString()),
            (context.response.body = JSON.stringify(result))
        },
      ],
    })(target, propertyKey)

    Metadata('@http:methods', methods, (value, previous) =>
      previous.concat(value),
    )(target, propertyKey)

    if (route) Path(route)(target, propertyKey)

    if (accept) Accept(accept)(target, propertyKey)
  }
}

interface HttpMethodDecorator {
  (target: Class | object, propertyKey: string | symbol): void
  (path: string): (target: Class | object, propertyKey: string | symbol) => void
}

function factory(
  httpMethod: HttpMethod | [HttpMethod, ...HttpMethod[]],
): HttpMethodDecorator {
  return ((
    targetOrPath: Class | object | string | string[],
    propertyKey?: string | symbol,
  ) => {
    if (typeof targetOrPath === 'string' || Array.isArray(targetOrPath))
      return Route(httpMethod, targetOrPath)

    return Route(httpMethod)(targetOrPath, propertyKey!)
  }) as HttpMethodDecorator
}

export const GET = factory('GET')
export const POST = factory('POST')
export const PUT = factory('PUT')
export const PATCH = factory('PATCH')
export const DELETE = factory('DELETE')
export const OPTIONS = factory('OPTIONS')
export const HEAD = factory('HEAD')
export const CONNECT = factory('CONNECT')
export const TRACE = factory('TRACE')

declare global {
  namespace Bluish {
    namespace Action {
      interface Metadata {
        '@http:methods': HttpMethod[]
      }
    }
  }
}
