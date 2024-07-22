import { HttpMethod } from '../decorators/Route.js'
import { IncomingHttpHeaders } from 'http'

export class Request {
  public method!: HttpMethod

  public url!: URL

  public params!: Record<string, unknown>

  public query!: Record<string, unknown>

  public headers: IncomingHttpHeaders = {}

  public body!: any;

  [key: string]: unknown
  [key: number]: unknown
  [key: symbol]: unknown
}
