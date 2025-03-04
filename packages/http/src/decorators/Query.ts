import { Input } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export function Query(
  target: ((...args: any[]) => any) | object,
  propertyKey: string | symbol,
  parameterIndex: number,
) {
  Input(HttpContext, context => context.request.query)(
    target,
    propertyKey,
    parameterIndex,
  )
}
