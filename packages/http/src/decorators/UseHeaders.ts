import { Argument } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export function UseHeaders(
  target: Function | Object,
  propertyKey: string | symbol,
  parameterIndex: number,
) {
  Argument(HttpContext, context => context.request.headers)(
    target,
    propertyKey,
    parameterIndex,
  )
}
