import { Context } from '@bluish/core'
import { IWebSocketConnection } from './IWebSocketConnection.js'
import { HttpContext, IHttpRequest, IHttpResponse } from '@bluish/http'

export class WebSocketContext extends Context {
  constructor(public readonly connection: IWebSocketConnection) {
    super()
  }
}

export class WebSocketConnectedContext extends WebSocketContext {
  public readonly response: IHttpResponse = {
    headers: {},
    status: 101,
  }

  constructor(
    connection: IWebSocketConnection,
    public readonly request: IHttpRequest,
  ) {
    super(connection)
  }

  [key: string]: any
}

const hasIstance = HttpContext[Symbol.hasInstance]

Object.defineProperty(HttpContext, Symbol.hasInstance, {
  value(instance: any) {
    return (
      hasIstance.call(this, instance) ||
      instance instanceof WebSocketConnectedContext
    )
  },
})

export class WebSocketMessageContext extends WebSocketContext {
  constructor(
    public data: unknown,
    public isBinary: boolean,
    connection: IWebSocketConnection,
  ) {
    super(connection)
  }
}

export class WebSocketCloseContext extends WebSocketContext {
  constructor(
    public readonly code: number,
    public readonly reason: Buffer,
    connection: IWebSocketConnection,
  ) {
    super(connection)
  }
}

export class WebSocketErrorContext extends WebSocketContext {
  constructor(
    public readonly error: Error,
    connection: IWebSocketConnection,
  ) {
    super(connection)
  }
}

export class WebSocketPingContext extends WebSocketContext {
  constructor(
    public data: unknown,
    connection: IWebSocketConnection,
  ) {
    super(connection)
  }
}

export class WebSocketPongContext extends WebSocketContext {
  constructor(
    public data: unknown,
    connection: IWebSocketConnection,
  ) {
    super(connection)
  }
}
