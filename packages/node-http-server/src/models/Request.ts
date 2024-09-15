import { HttpMethod, HttpRequest } from '@bluish/http'
import type http from 'node:http'

export class Request extends HttpRequest {
  constructor(public readonly native: http.IncomingMessage) {
    super()

    this.url = new URL(`http://${process.env.HOST ?? '0.0.0.0'}${native.url}`)
    this.body = native
    this.headers = native.headers
    this.method = native.method!.toUpperCase() as HttpMethod
  }
}
