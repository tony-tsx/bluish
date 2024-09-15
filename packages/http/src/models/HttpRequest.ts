import { HttpMethod } from '../decorators/Route.js'
import type { IncomingHttpHeaders } from 'node:http'

export class HttpRequest {
  #url!: URL

  public headers: IncomingHttpHeaders = {}

  public method!: HttpMethod

  public set url(url: string | URL) {
    if (typeof url === 'string') this.#url = new URL(url)
    else this.#url = url

    this.query = Object.fromEntries(this.#url.searchParams)
  }

  public get url(): URL {
    return this.#url
  }

  public params: Record<string, unknown> = {}

  public query: Record<string, unknown> = {}

  public body!: any;

  [key: string]: unknown
  [key: number]: unknown
  [key: symbol]: unknown
}
