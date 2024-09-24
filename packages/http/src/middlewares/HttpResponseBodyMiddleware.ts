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

      let contentType: ApplicationHttpSourceContentType | undefined
      let type: string | undefined

      for (const [, accepts] of qualifierAccept(context, true)) {
        const acceptedContentTypes = contentTypes.filter(contentType =>
          contentType.is(accepts),
        )

        if (!acceptedContentTypes.length) continue

        contentType = acceptedContentTypes.reduce((left, right) =>
          right.quality > left.quality ? right : left,
        )

        type = contentType.is(accepts) as string

        break
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

      if (payload === undefined) return

      await contentType.add(type!, null, payload, context)
    })
  }
}
