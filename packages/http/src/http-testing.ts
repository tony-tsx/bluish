import { HttpMethod } from './decorators/Route.js'
import { HttpContext } from './models/HttpContext.js'
import { HttpRequest } from './models/HttpRequest.js'
import { HttpResponse } from './models/HttpResponse.js'

namespace HttpTesting {
  export interface ToContextInput {
    method?: HttpMethod | Lowercase<HttpMethod>
    headers?: Record<string, undefined | string | string[]>
    url?: string | URL
    body?: string
  }

  export function toContext({
    method = 'GET',
    url: _url = '/',
    headers = {},
    body,
  }: ToContextInput = {}): HttpContext {
    const url = new URL(_url, `http://${process.env.HOST ?? '0.0.0.0'}`)

    const request = new HttpRequest()
    const response = new HttpResponse()

    Object.assign(request, {
      method: method.toUpperCase(),
      headers: Object.fromEntries(
        Object.entries(headers)
          .map(([key, value]) => [
            [key, value],
            [key.toLowerCase(), value],
          ])
          .flat(),
      ),
      url,
      body,
      params: {},
      query: Object.fromEntries(url.searchParams),
    })

    return new HttpContext(request, response)
  }
}

export default HttpTesting
