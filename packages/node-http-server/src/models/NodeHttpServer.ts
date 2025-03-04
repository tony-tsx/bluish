import http from 'node:http'
import { toRequestListener } from './toRequestListener.js'
import { Router } from '@bluish/http-router'
import { NodeHttpRequest } from './NodeHttpRequest.js'
import { NodeHttpResponse } from './NodeHttpResponse.js'
import { Application } from '@bluish/core'

export interface PureNodeHttpServerOptions {
  onResponseBodyReadableReceive?: 'pause' | 'auto send' | 'nothing'
}

export interface NodeHttpServerOptions<
  TRequest extends typeof NodeHttpRequest = typeof NodeHttpRequest,
  TResponse extends typeof NodeHttpResponse = typeof NodeHttpResponse,
> extends http.ServerOptions<TRequest, TResponse>,
    PureNodeHttpServerOptions {}

export class NodeHttpServer<
  TRequest extends typeof NodeHttpRequest = typeof NodeHttpRequest,
  TResponse extends typeof NodeHttpResponse = typeof NodeHttpResponse,
> extends http.Server<TRequest, TResponse> {
  public readonly application!: Application

  constructor(
    public readonly router: Router,
    {
      IncomingMessage = NodeHttpRequest as TRequest,
      ServerResponse = NodeHttpResponse as TResponse,
      ...options
    }: NodeHttpServerOptions<TRequest, TResponse> = {},
  ) {
    super(
      {
        IncomingMessage,
        ServerResponse,
        ...options,
      },
      toRequestListener(router, options),
    )

    this.application = this.router.application
  }
}
