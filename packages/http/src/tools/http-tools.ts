import { HttpContext } from '../http.js'
import {
  HTTP_QUALIFIED_ACCEPT,
  HTTP_QUALIFIED_ACCEPT_QUALITY_CHUNKED,
} from '../constants/constants.js'

import { parse as contentTypeParse } from 'content-type'

export { is as contentTypeIs } from 'type-is'

export { contentTypeParse }

export function qualifierAccept<
  TReturnQualityChunk extends true | false = false,
>(
  context: HttpContext,
  returnChunk: TReturnQualityChunk = false as TReturnQualityChunk,
): TReturnQualityChunk extends true ? [number, string[]][] : string[] {
  if (context[HTTP_QUALIFIED_ACCEPT])
    if (returnChunk) return context[HTTP_QUALIFIED_ACCEPT_QUALITY_CHUNKED]
    else return context[HTTP_QUALIFIED_ACCEPT]

  if (!context.request.headers.accept) context.request.headers.accept = '*/*'

  const accepts = context.request.headers.accept
    .split(',')
    .map(accept => contentTypeParse(accept))
    .map(accept => {
      accept.parameters.q = accept.parameters.q ?? '1'

      return accept
    })
    .sort((acceptLeft, acceptRight) => {
      const acceptLeftQuality = parseFloat(acceptLeft.parameters.q)
      const acceptRightQuality = parseFloat(acceptRight.parameters.q)

      if (acceptLeftQuality === acceptRightQuality) return 0

      return acceptLeftQuality >= acceptRightQuality ? -1 : 1
    })

  const chunks: [number, string[]][] = []

  for (const accept of accepts) {
    const quality = parseFloat(accept.parameters.q)

    const chunk = chunks.find(([_quality]) => _quality === quality)

    if (!chunk) chunks.push([quality, [accept.type]])
    else chunk[1].push(accept.type)
  }

  context[HTTP_QUALIFIED_ACCEPT] = accepts
  context[HTTP_QUALIFIED_ACCEPT_QUALITY_CHUNKED] = chunks

  if (returnChunk) return context[HTTP_QUALIFIED_ACCEPT_QUALITY_CHUNKED]

  return context[HTTP_QUALIFIED_ACCEPT]
}
