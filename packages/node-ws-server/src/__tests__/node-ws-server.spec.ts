/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, it, vi } from 'vitest'
import { NodeWebSocketServer, WebSocket } from '../node-ws-server.js'
import { Application, Controller, Inject } from '@bluish/core'
import { WS } from '@bluish/ws'

it('emit connected event in application listeners', async () => {
  @Controller
  class Root {
    @WS.Connected
    public static act() {}
  }

  vi.spyOn(Root, 'act')

  const application = await new Application({
    controllers: [Root],
  }).bootstrap()

  const wss = new NodeWebSocketServer({ application, port: 0 })

  // @ts-expect-error: TODO
  const ws = new WebSocket(`ws://localhost:${wss.address()!.port}`)

  ws.on('open', ws.close)

  await new Promise(done => {
    wss.on('connection', ws => {
      ws.on('close', () => {
        wss.close(done)
      })
    })
  })

  expect(Root.act).toHaveBeenCalled()
})

it('emit message event in application listeners', async () => {
  @Controller
  class Root {
    public static act(@WS.Message message: Buffer) {}
  }

  vi.spyOn(Root, 'act')

  const application = await new Application({
    controllers: [Root],
  }).bootstrap()

  const wss = new NodeWebSocketServer({ application, port: 0 })

  // @ts-expect-error: TODO
  const ws = new WebSocket(`ws://localhost:${wss.address()!.port}`)

  ws.on('open', () => {
    ws.send('Hello World!', () => {
      ws.close()
    })
  })

  await new Promise(done => {
    wss.on('connection', ws => {
      ws.on('close', () => {
        wss.close(done)
      })
    })
  })

  expect(Root.act).toHaveBeenCalledWith(Buffer.from('Hello World!'))
})

it('emit ping event in application listeners', async () => {
  @Controller
  class Root {
    @WS.Ping
    public static act() {}
  }

  vi.spyOn(Root, 'act')

  const application = await new Application({
    controllers: [Root],
  }).bootstrap()

  const wss = new NodeWebSocketServer({ application, port: 0 })

  // @ts-expect-error: TODO
  const ws = new WebSocket(`ws://localhost:${wss.address()!.port}`)

  ws.on('open', ws.ping)
  ws.on('pong', () => {
    ws.close()
  })

  await new Promise(done => {
    wss.on('connection', ws => {
      ws.on('close', () => {
        wss.close(done)
      })
    })
  })

  expect(Root.act).toHaveBeenCalled()
})

it('emit pong event in application listeners', async () => {
  @Controller
  class Root {
    @WS.Pong
    public static act() {}
  }

  vi.spyOn(Root, 'act')

  const application = await new Application({
    controllers: [Root],
  }).bootstrap()

  const wss = new NodeWebSocketServer({ application, port: 0 })

  // @ts-expect-error: TODO
  const ws = new WebSocket(`ws://localhost:${wss.address()!.port}`)

  ws.on('open', ws.pong)
  ws.on('ping', () => {
    ws.close()
  })

  await new Promise(done => {
    wss.on('connection', ws => {
      ws.ping()
      ws.on('close', () => {
        wss.close(done)
      })
    })
  })

  expect(Root.act).toHaveBeenCalled()
})

it('inject websocket connection', async () => {
  @Controller
  class Root {
    @WS.Connected
    public static act(
      @Inject(() => WebSocket)
      ws: WebSocket,
    ) {}
  }

  vi.spyOn(Root, 'act')

  const application = await new Application({
    controllers: [Root],
  }).bootstrap()

  const wss = new NodeWebSocketServer({ application, port: 0 })

  // @ts-expect-error: TODO
  const ws = new WebSocket(`ws://localhost:${wss.address()!.port}`)

  ws.on('open', ws.close)

  await new Promise(done => {
    wss.on('connection', ws => {
      ws.on('close', () => {
        wss.close(done)
      })
    })
  })

  expect(Root.act).toHaveBeenCalledWith(expect.any(WebSocket))
})
