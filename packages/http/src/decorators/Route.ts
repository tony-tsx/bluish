import { Action, Class, Metadata } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'
import { Path } from './Path.js'
import { ALL_HTTP_METHODS, HTTP_METHOD } from '../constants/constants.js'

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
  method: (HttpMethod | 'ALL') | HttpMethod[],
  route?: string | string[],
) {
  if (method === 'ALL') method = ALL_HTTP_METHODS

  const methods = new Set(Array.isArray(method) ? method : [method])

  return (
    target: Class | object,
    propertyKey: string | symbol,
    propertyDescriptor: TypedPropertyDescriptor<any>,
  ) => {
    Action(HttpContext)(target, propertyKey, propertyDescriptor)

    Metadata(HTTP_METHOD, methods, (value, previous) => previous.union(value))(
      target,
      propertyKey,
      propertyDescriptor,
    )

    if (route) Path(route)(target, propertyKey)
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
    propertyKey: string | symbol,
    propertyDescriptor: TypedPropertyDescriptor<any>,
  ) => {
    if (typeof targetOrPath === 'string' || Array.isArray(targetOrPath))
      return Route(httpMethod, targetOrPath)

    return Route(httpMethod)(targetOrPath, propertyKey, propertyDescriptor)
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
