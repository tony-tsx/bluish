import { Router } from '@bluish/http-router'
import { NodeHttpRequest } from './NodeHttpRequest.js'
import { NodeHttpResponse } from './NodeHttpResponse.js'
import { NodeHttpContext } from './NodeHttpContext.js'
import { PureNodeHttpServerOptions } from './NodeHttpServer.js'

export function toRequestListener(
  router: Router,
  // eslint-disable-next-line no-empty-pattern
  {}: PureNodeHttpServerOptions,
) {
  return async (request: NodeHttpRequest, response: NodeHttpResponse) => {
    const context = new NodeHttpContext(request, response)

    await router.dispatch(context)

    if (!response.headersSent) {
      response.writeHead(response.statusCode, context.response.headers)
      response.end(context.response.body)
    }
  }
}
