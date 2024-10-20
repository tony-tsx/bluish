import { Application, Class, Context, Injectable } from '@bluish/core'
import NodeHttpServer, {
  NodeHttpRequest,
  NodeHttpResponse,
} from '@bluish/node-http-server'
import { WebSocketServer, ServerOptions, WebSocket } from 'ws'
import {
  WebSocketConnectedContext,
  WebSocketCloseContext,
  WebSocketPingContext,
  WebSocketPongContext,
  WebSocketErrorContext,
  WebSocketMessageContext,
  WebSocketContext,
  IWebSocketConnection,
} from '@bluish/ws'
import { HttpMethod, IHttpRequest } from '@bluish/http'

export { WebSocket }

export class NodeWebSocketConnectedContext extends WebSocketConnectedContext {
  constructor(connection: IWebSocketConnection, request: IHttpRequest) {
    super(connection, request)

    request.method = request.method?.toUpperCase() as HttpMethod

    request.self = new URL(request.url ?? '', `http://${request.headers.host}`)

    request.query = Object.fromEntries(request.self.searchParams)
  }
}

Injectable.register(
  WebSocket,
  'context',
  (context: Context) => {
    if (!(context instanceof WebSocketContext)) return undefined

    return context.connection
  },
  Context,
)

export interface NodeWebSocketServerOptions<
  TWebSocket extends typeof WebSocket = typeof WebSocket,
  TNodeHttpRequest extends typeof NodeHttpRequest = typeof NodeHttpRequest,
> extends ServerOptions<TWebSocket, TNodeHttpRequest> {
  application?: Application
  server?: NodeHttpServer<TNodeHttpRequest, typeof NodeHttpResponse>
}

export class NodeWebSocketServer<
  TWebSocket extends typeof WebSocket = typeof WebSocket,
  TNodeHttpRequest extends typeof NodeHttpRequest = typeof NodeHttpRequest,
> extends WebSocketServer<TWebSocket, TNodeHttpRequest> {
  public readonly application!: Application

  constructor(
    options?: NodeWebSocketServerOptions<TWebSocket, TNodeHttpRequest>,
  ) {
    super(options)

    const application = options?.server?.application ?? options?.application

    if (!application) throw new Error('Application is required')

    this.application = application

    const actions = this.application.actions.map([
      WebSocketConnectedContext,
      WebSocketMessageContext,
      WebSocketPingContext,
      WebSocketPongContext,
      WebSocketCloseContext,
      WebSocketErrorContext,
    ])

    this.on('connection', (ws, request) => {
      let ready: Promise<unknown> | undefined
      const _ready = <T extends Function>(fn: T): T =>
        (async (...args: any[]) => {
          await ready

          return fn(...args)
        }) as unknown as T

      const _call = <TArgs extends any[]>(
        fn: (...args: TArgs) => Context,
      ): ((...args: TArgs) => Promise<void>) =>
        _ready(async function name(...args: TArgs) {
          const context = fn(...args)

          await Promise.all(
            actions
              .get(context.constructor as Class<Context>)!
              .map(action => action.run(context)),
          )
        })

      const message = _call(
        (message: Buffer, isBinary: boolean) =>
          new WebSocketMessageContext(message, isBinary, ws),
      )
      const close = _call(
        (code: number, reason: Buffer) =>
          new WebSocketCloseContext(code, reason, ws),
      )
      const ping = _call((data: Buffer) => new WebSocketPingContext(data, ws))
      const pong = _call((data: Buffer) => new WebSocketPongContext(data, ws))
      const error = _call(
        (error: Error) => new WebSocketErrorContext(error, ws),
      )

      ws.on('message', message)
      ws.on('close', close)
      ws.on('ping', ping)
      ws.on('pong', pong)
      ws.on('error', error)

      const context = new NodeWebSocketConnectedContext(ws, request)

      ready = Promise.all(
        actions
          .get(WebSocketConnectedContext)!
          .map(action => action.run(context)),
      ).finally(() => {
        ready = undefined
      })
    })
  }
}
