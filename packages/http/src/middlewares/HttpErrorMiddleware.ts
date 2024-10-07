import {
  HTTP_CONTEXT_ACTION_CONTENT_MIME_TYPE,
  HTTP_CONTEXT_ACTION_CONTENT_TYPE,
} from '../constants/constants.js'
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

        if (error.status >= 500) throw error

        context.response.status = error.status

        if (context[HTTP_CONTEXT_ACTION_CONTENT_TYPE]) {
          const data = await context[
            HTTP_CONTEXT_ACTION_CONTENT_TYPE
          ].serializer(error, null, context)

          if (data.type === undefined)
            if (context[HTTP_CONTEXT_ACTION_CONTENT_MIME_TYPE])
              data.type = context[HTTP_CONTEXT_ACTION_CONTENT_MIME_TYPE]
            else
              data.type =
                context[HTTP_CONTEXT_ACTION_CONTENT_TYPE].contentType[0]

          context.response.headers['Content-Type'] = data.type

          if (data.length === undefined) {
            if (typeof data.content === 'string')
              data.length = data.content.length
            else data.length = data.content.byteLength
          }

          context.response.headers['Content-Length'] = `${data.length}`

          context.response.body = data.content
        }

        const content = `${error.message}`

        context.response.headers['Content-Type'] = 'text/html'
        context.response.headers['Content-Length'] = `${content.length}`
        context.response.body = content
      }
    })
  }
}
