import { Context } from '@bluish/core'
import { IWebSocketConnection } from './IWebSocketConnection.js'

export class WebSocketContext extends Context {
  constructor(public readonly connection: IWebSocketConnection) {
    super()
  }
}

export class WebSocketConnectedContext extends WebSocketContext {}

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
