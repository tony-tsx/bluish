import { Argument } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export function UseQuery(
  target: Function | Object,
  propertyKey: string | symbol,
  parameterIndex: number,
) {
  Argument(HttpContext, context => context.request.query)(
    target,
    propertyKey,
    parameterIndex,
  )
}
