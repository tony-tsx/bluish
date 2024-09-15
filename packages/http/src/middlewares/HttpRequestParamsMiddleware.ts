import { Next } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'
import { HttpMiddleware } from './HttpMiddleware.js'
import { match } from 'path-to-regexp'
import { getPath } from '../tools/getPath.js'

export class HttpRequestParamsMiddleware extends HttpMiddleware {
  constructor() {
    super(async (context: HttpContext, next: Next) => {
      const result = match(getPath(context.action))(
        context.request.url.pathname,
      )

      if (result === false) return next()

      context.request.params = result.params

      return next()
    })
  }
}
