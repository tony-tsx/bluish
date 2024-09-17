import { getContentType } from '../tools/getContentType.js'
import { HttpMiddleware } from './HttpMiddleware.js'
import { ApplicationHttpSourceContentType } from '../models/ApplicationHttpSourceContentType.js'
import { NotAcceptable } from '../errors/HttpError.js'
import {
  HTTP_CONTEXT_ACTION_CONTENT_MIME_TYPE,
  HTTP_CONTEXT_ACTION_CONTENT_TYPE,
} from '../constants/constants.js'
import { qualifierAccept } from '../tools/http-tools.js'

export class HttpResponseBodyMiddleware extends HttpMiddleware {
  constructor() {
    super(async (context, next) => {
      const contentTypes = getContentType(context.action)
      const accepts = qualifierAccept(context)

      let contentType: ApplicationHttpSourceContentType | undefined
      let type: string | undefined

      for (const accept of accepts) {
        for (const _contentType of contentTypes) {
          const _type = _contentType.is(accept)

          if (_type === false) continue

          contentType = _contentType
          type = _type

          break
        }

        if (contentType) break
      }

      if (!contentType)
        if (!contentTypes.length) return next()
        else
          throw new NotAcceptable(
            `The requested content type is not available. Supported content types are: ${contentTypes.flatMap(contentType => contentType.contentType).join(', ')}`,
          )

      context[HTTP_CONTEXT_ACTION_CONTENT_TYPE] = contentType
      context[HTTP_CONTEXT_ACTION_CONTENT_MIME_TYPE] = type

      await next()

      if (context.response.body !== undefined) return

      const payload = context.payload ?? context.return

      await contentType.add(type!, null, payload, context)
    })
  }
}
