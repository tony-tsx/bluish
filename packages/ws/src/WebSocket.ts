import { actionDecoratorFactory, Input } from '@bluish/core'
import {
  WebSocketConnectedContext,
  WebSocketMessageContext,
  WebSocketCloseContext,
  WebSocketErrorContext,
  WebSocketPingContext,
  WebSocketPongContext,
  WebSocketContext,
} from './WebSocketContext.js'

export namespace WS {
  export const Connection = Input(
    WebSocketContext,
    context => context.connection,
  )

  export const Connected = actionDecoratorFactory({
    context: WebSocketConnectedContext,
    input: context => context.connection,
  })

  export const Message = actionDecoratorFactory({
    context: WebSocketMessageContext,
    input: context => context.data,
  })

  export const Close = actionDecoratorFactory({
    context: WebSocketCloseContext,
    input: context => context,
  })

  export const Error = actionDecoratorFactory({
    context: WebSocketErrorContext,
    input: context => context.error,
  })

  export const Ping = actionDecoratorFactory({
    context: WebSocketPingContext,
    input: context => context.data,
  })

  export const Pong = actionDecoratorFactory({
    context: WebSocketPongContext,
    input: context => context.data,
  })
}
