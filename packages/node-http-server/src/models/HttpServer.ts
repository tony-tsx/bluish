import http from 'node:http'
import { toRequestListener } from './toRequestListener.js'
import { Router } from '@bluish/http-router'

export interface HttpServerOptions<
  Request extends typeof http.IncomingMessage = typeof http.IncomingMessage,
  Response extends typeof http.ServerResponse = typeof http.ServerResponse,
> extends http.ServerOptions<Request, Response> {}

export class HttpServer extends http.Server {
  constructor(
    public readonly router: Router,
    options: HttpServerOptions = {},
  ) {
    super(options, toRequestListener(router))
  }
}
