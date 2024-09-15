import { Middleware, Next } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export class HttpMiddleware extends Middleware<HttpContext> {
  constructor(fn: (context: HttpContext, next: Next) => unknown) {
    super(HttpContext, fn)
  }
}
