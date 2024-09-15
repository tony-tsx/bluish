import { HttpContext, HttpMethod } from '@bluish/http'
import { NodeHttpRequest } from './NodeHttpRequest.js'
import { NodeHttpResponse } from './NodeHttpResponse.js'

export class NodeHttpContext<
  TNodeHttpRequest extends NodeHttpRequest = NodeHttpRequest,
  TNodeHttpResponse extends NodeHttpResponse = NodeHttpResponse,
> extends HttpContext<TNodeHttpRequest, TNodeHttpResponse> {
  constructor(request: TNodeHttpRequest, response: TNodeHttpResponse) {
    super(request, response)

    request.method = request.method!.toUpperCase() as HttpMethod

    request.self = new URL(request.url ?? '', `http://${request.headers.host}`)

    request.query = Object.fromEntries(request.self.searchParams)
  }
}
