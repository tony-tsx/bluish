import { HTTP_QUALIFIED_ACCEPT, HttpContext } from '../http.js'

import { parse as contentTypeParse } from 'content-type'

export { is as contentTypeIs } from 'type-is'

export { contentTypeParse }

export function qualifierAccept(context: HttpContext): string[] {
  if (context[HTTP_QUALIFIED_ACCEPT]) return context[HTTP_QUALIFIED_ACCEPT]

  if (!context.request.headers.accept) context.request.headers.accept = '*/*'

  const accepts = context.request.headers.accept
    .split(',')
    .map(accept => contentTypeParse(accept))
    .sort((acceptLeft, acceptRight) => {
      const acceptLeftQuality = parseFloat(acceptLeft.parameters.q ?? '1')
      const acceptRightQuality = parseFloat(acceptRight.parameters.q ?? '1')

      if (acceptLeftQuality === acceptRightQuality) return 0

      return acceptLeftQuality >= acceptRightQuality ? -1 : 1
    })
    .map(accept => accept.type)

  context[HTTP_QUALIFIED_ACCEPT] = accepts

  return context[HTTP_QUALIFIED_ACCEPT]
}
