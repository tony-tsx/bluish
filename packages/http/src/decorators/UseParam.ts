import { Argument } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export function UseParam(key: string) {
  return (
    target: Function | Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    Argument(HttpContext, context => {
      return context.request.params[key]
    })(target, propertyKey, parameterIndex)
  }
}
