import { HTTP_CONTEXT_ACTION_CONTENT_TYPE } from '../constants/constants.js'
import { HttpError } from '../errors/HttpError.js'
import { HttpContext } from '../http.js'
import { HttpMiddleware } from './HttpMiddleware.js'

export interface httpErrorMiddlewareOptions {
  onUnknownCatch?(error: unknown, context: HttpContext): unknown
}

export class HttpErrorMiddleware extends HttpMiddleware {
  constructor({ onUnknownCatch }: httpErrorMiddlewareOptions = {}) {
    super(async (context, next) => {
      try {
        return await next()
      } catch (error) {
        if (typeof error !== 'object') throw error

        if (!(error instanceof HttpError))
          if (onUnknownCatch) return await onUnknownCatch(error, context)
          else throw error

        context.response.status = error.status

        if (context[HTTP_CONTEXT_ACTION_CONTENT_TYPE]) {
          const [type, contentType] = context[HTTP_CONTEXT_ACTION_CONTENT_TYPE]

          return await contentType.set(type, error, null, context)
        }

        const content = Buffer.from(`${error.message}`)

        context.response.headers['Content-Type'] = 'plain/text'
        context.response.headers['Content-Length'] = `${content.byteLength}`
        context.response.body = content
      }
    })
  }
}
