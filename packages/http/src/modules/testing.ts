import { ALL_HTTP_METHODS } from '../constants/constants.js'
import { HttpMethod } from '../decorators/Route.js'
import { HttpContext } from '../models/HttpContext.js'

function isHttpMethod(
  value: unknown,
): value is HttpMethod | Lowercase<HttpMethod> {
  return ALL_HTTP_METHODS.some(
    method => method === value || method.toLowerCase() === value,
  )
}

namespace BluishHttpTesting {
  export interface ToContextOptions {
    method?: HttpMethod | Lowercase<HttpMethod>
    headers?: Record<string, undefined | string | string[]>
    query?: Record<string, undefined | string | string[]>
    url?: string | URL
    body?: any
  }

  export function toContext(options?: ToContextOptions): HttpContext
  export function toContext(
    url: URL | string,
    options?: Omit<ToContextOptions, 'url'>,
  ): HttpContext
  export function toContext(
    method: HttpMethod | Lowercase<HttpMethod>,
    options?: Omit<ToContextOptions, 'method'>,
  ): HttpContext
  export function toContext(
    method: HttpMethod | Lowercase<HttpMethod>,
    url: URL | string,
    options?: Omit<ToContextOptions, 'method' | 'url'>,
  ): HttpContext
  export function toContext(
    maybeOptionsOrUrlOrMethod?:
      | HttpMethod
      | Lowercase<HttpMethod>
      | URL
      | string
      | ToContextOptions,
    maybeOptionsOrUrl?: string | URL | ToContextOptions,
    maybeOptions?: ToContextOptions,
  ): HttpContext {
    const options: ToContextOptions = {}

    if (typeof maybeOptionsOrUrlOrMethod === 'object')
      if (maybeOptionsOrUrlOrMethod instanceof URL)
        options.url = maybeOptionsOrUrlOrMethod
      else Object.assign(options, maybeOptionsOrUrlOrMethod)
    else if (typeof maybeOptionsOrUrlOrMethod === 'string')
      if (isHttpMethod(maybeOptionsOrUrlOrMethod))
        options.method = maybeOptionsOrUrlOrMethod
      else options.url = maybeOptionsOrUrlOrMethod
    else {
      /* nothing */
    }

    if (typeof maybeOptionsOrUrl === 'object')
      if (maybeOptionsOrUrl instanceof URL) options.url = maybeOptionsOrUrl
      else Object.assign(options, maybeOptionsOrUrl)
    else if (typeof maybeOptionsOrUrl === 'string')
      options.url = maybeOptionsOrUrl
    else {
      /* nothing */
    }

    if (typeof maybeOptions === 'object') Object.assign(options, maybeOptions)

    options.method ??= 'GET'

    options.url ??= '/'

    options.headers ??= {}

    const method = options.method.toUpperCase() as HttpMethod

    const self = new URL(options.url, `http://${process.env.HOST ?? '0.0.0.0'}`)

    const params = {}

    const query = Object.fromEntries(self.searchParams)

    const headers = Object.fromEntries(
      Object.entries(options.headers)
        .map(([key, value]) => [
          [key, value],
          [key.toLowerCase(), value],
        ])
        .flat(),
    )

    const body = options.body

    return new HttpContext(
      { method, self, params, query, headers, body },
      { headers: {}, status: NaN },
    )
  }
}

export default BluishHttpTesting
