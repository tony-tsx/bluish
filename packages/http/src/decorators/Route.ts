import { Action, Class, Metadata } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'
import { Path } from './Path.js'
import { Accept } from './Accept.js'
import { is } from 'type-is'
import { ContentType } from './ContentType.js'
import { toContentTypes } from '../tools/action-helpers.js'

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
          const payload = await next()

          if (!context.response.status) context.response.status = 200

          if (context.response.body) return payload

          const contentTypes = toContentTypes(context.runner.action)

          if (!contentTypes.length) return payload

          let contentType: ContentType | undefined

          if (contentTypes.length > 1) {
            const accept = context.request.headers.accept

            if (!accept) throw new Error('TODO')

            contentType = contentTypes.find(({ type }) => is(type, accept))
          } else contentType = contentTypes[0]

          if (!contentType) throw new Error('TODO')

          context.response.headers['Content-Type'] = contentType.type

          context.response.body = contentType.to(payload, context)

          return payload
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
