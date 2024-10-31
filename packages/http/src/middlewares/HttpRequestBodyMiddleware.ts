import { Next } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'
import { getAccept } from '../tools/getAccept.js'
import { HttpMiddleware } from './HttpMiddleware.js'
import {
  BadRequest,
  LengthRequired,
  UnsupportedMediaType,
} from '../errors/HttpError.js'
import content from 'content-type'
import { HTTP_ACCEPT } from '../constants/constants.js'
import { ApplicationHttpSourceAccept } from '../models/ApplicationHttpSourceAccept.js'

function getContentTypeCharset(
  type: string | undefined,
  defaultCharset = 'utf-8',
) {
  if (!type) return defaultCharset

  try {
    return content.parse(type)?.parameters?.charset ?? defaultCharset
  } catch {
    return defaultCharset
  }
}

export interface HttpRequestBodyMiddlewareOptions {
  lengthRequired?: boolean
  skipGetContent?: boolean
}

export class HttpRequestBodyMiddleware extends HttpMiddleware {
  constructor({
    lengthRequired = false,
    // contentTypeRequired = false,
    skipGetContent = true,
  }: HttpRequestBodyMiddlewareOptions = {}) {
    super(async (context: HttpContext, next: Next) => {
      if (context.request.method === 'GET' && skipGetContent) return next()

      if (context.request._body) return next()

      if (!context.request.body) return next()

      if (context.request.headers['content-length'] === '0') return next()

      if (lengthRequired && !context.request.headers['content-length'])
        throw new LengthRequired()

      let accept: ApplicationHttpSourceAccept | undefined

      if (context.request.headers['content-type']) {
        for (const _accept of getAccept(context.action)) {
          if (!_accept.is(context.request.headers['content-type']!)) continue

          accept = _accept

          break
        }

        if (!accept) throw new UnsupportedMediaType()
      }

      if (!accept) return next()

      context[HTTP_ACCEPT] = accept

      if (context.request.headers['content-length']) {
        const length = parseInt(context.request.headers['content-length'], 10)

        if (isNaN(length)) throw new BadRequest('Invalid content length')

        accept.assert(length)
      }

      const charset = getContentTypeCharset(
        context.request.headers['content-type'],
        'utf-8',
      )

      if (!charset.startsWith(accept.charset))
        throw new UnsupportedMediaType(
          `Unsupported charset "${charset.toUpperCase()}"`,
        )

      context.request._body = context.request.body

      if (accept.middleware)
        return accept.middleware.call(accept, context, async () => {
          context.request.body = await accept.parse(context)

          return next()
        })

      context.request.body = await accept.parse(context)

      return next()
    })
  }
}
