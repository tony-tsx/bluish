import { HttpMethod } from '../decorators/Route.js'
import http from 'node:http'

export interface IHttpRequest {
  readonly headers: http.IncomingHttpHeaders

  method: HttpMethod

  self: URL

  params: Record<string, any>

  query: Record<string, any>

  body: any

  [key: string]: any
  [key: number]: any
  [key: symbol]: any
}
