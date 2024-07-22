import { Class, Selector } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'
import { is } from 'type-is'
import { Accept } from './Accept.js'

export function UseBody(
  target: Class | Object,
  propertyKey: string | symbol,
  parameterIndex: number,
): void
export function UseBody(
  contentType: string | string[],
): (
  target: Class | Object,
  propertyKey: string | symbol,
  parameterIndex: number,
) => void
export function UseBody(
  targetOrContentType: string | string[] | Class | Object,
  maybePropertyKey?: string | symbol,
  maybeParameterIndex?: number,
) {
  if (
    typeof targetOrContentType === 'string' ||
    Array.isArray(targetOrContentType)
  ) {
    const accepts: string[] = Array.isArray(targetOrContentType)
      ? targetOrContentType
      : [targetOrContentType]

    return (
      target: Class | Object,
      propertyKey: string | symbol,
      parameterIndex: number,
    ) => {
      Selector(HttpContext, context => {
        if (!context.request.headers['content-type']) return null

        if (!is(context.request.headers['content-type'], accepts)) return null

        return context.request.body
      })(target, propertyKey, parameterIndex)

      Accept(accepts)(target, propertyKey)
    }
  }

  if (maybePropertyKey === undefined)
    throw new TypeError('Property key is required')

  if (maybeParameterIndex === undefined)
    throw new TypeError('Parameter index is required')

  Selector(HttpContext, context => context.request.body)(
    targetOrContentType,
    maybePropertyKey,
    maybeParameterIndex,
  )
}
