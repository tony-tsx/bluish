import { Selector } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export function UseHeader(key: string) {
  return Selector(HttpContext, context => context.request.headers[key])
}
