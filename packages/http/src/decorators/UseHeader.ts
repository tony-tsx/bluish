import { Argument } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export function UseHeader(key: string) {
  return Argument(HttpContext, context => context.request.headers[key])
}
