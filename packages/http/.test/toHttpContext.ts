import { HttpMethod } from '../src/decorators/Route.js'
import { HttpContext } from '../src/models/HttpContext.js'
import { HttpRequest } from '../src/models/HttpRequest.js'
import { HttpResponse } from '../src/models/HttpResponse.js'

export interface TestingHttpContextInput {
  body?: unknown
  headers?: Record<string, string | string[]>
  method?: HttpMethod
  url?: string
  path?: string
}

class TestingHttpContext extends HttpContext {
  constructor({
    body,
    headers = {},
    method,
    path = '/',
    url,
  }: TestingHttpContextInput = {}) {
    const request = new TestingHttpRequest()

    if (url) request.url = url
    else if (path) request.url = new URL(path, 'http://localhost')

    if (body && typeof body === 'object' && body.constructor === Object) {
      body = JSON.stringify(body)
      headers['content-type'] = 'application/json'
      headers['content-length'] = String(Buffer.byteLength(body as string))
    }

    if (body) method ??= 'POST'
    else method ??= 'GET'

    request.method = method
    request.headers = Object.fromEntries(
      Object.entries(headers).map(([name, value]) => [
        name.toLowerCase(),
        value,
      ]),
    )
    request.body = body

    super(request, new TestingHttpResponse())
  }
}

class TestingHttpRequest extends HttpRequest {}

class TestingHttpResponse extends HttpResponse {}

export function toHttpContext(): TestingHttpContext
export function toHttpContext(
  path: string,
  body?: unknown,
  headers?: Record<string, string | string[]>,
): TestingHttpContext
export function toHttpContext(
  input: TestingHttpContextInput,
): TestingHttpContext
export function toHttpContext(
  maybeInputOrPath?: TestingHttpContextInput | string,
  body?: unknown,
  headers?: Record<string, string | string[]>,
) {
  if (typeof maybeInputOrPath === 'string')
    return new TestingHttpContext({ path: maybeInputOrPath, body, headers })

  return new TestingHttpContext(maybeInputOrPath)
}
