import { Class, Metadata } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export function Param(
  name: string,
  loader: (param: string, context: HttpContext) => unknown,
) {
  return (target: Class) => {
    Metadata(`@http:param:${name}`, loader)(target)
  }
}
