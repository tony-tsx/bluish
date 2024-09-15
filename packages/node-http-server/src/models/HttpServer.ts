import http from 'node:http'
import { toRequestListener } from './toRequestListener.js'
import { Router } from '@bluish/http-router'
import { NodeHttpRequest } from './NodeHttpRequest.js'
import { NodeHttpResponse } from './NodeHttpResponse.js'

export interface HttpServerOptions<
  TRequest extends typeof NodeHttpRequest = typeof NodeHttpRequest,
  TResponse extends typeof NodeHttpResponse = typeof NodeHttpResponse,
  // @ts-expect-error: TODO
> extends http.ServerOptions<TRequest, TResponse> {}

export class HttpServer<
  TRequest extends typeof NodeHttpRequest = typeof NodeHttpRequest,
  TResponse extends typeof NodeHttpResponse = typeof NodeHttpResponse,
  // @ts-expect-error: TODO
> extends http.Server<TRequest, TResponse> {
  constructor(
    public readonly router: Router,
    {
      IncomingMessage = NodeHttpRequest as TRequest,
      ServerResponse = NodeHttpResponse as TResponse,
      ...options
    }: HttpServerOptions<TRequest, TResponse> = {},
  ) {
    super(
      {
        IncomingMessage,
        ServerResponse,
        ...options,
      },
      toRequestListener(router),
    )
  }
}
