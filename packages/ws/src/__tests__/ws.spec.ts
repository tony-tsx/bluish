/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, it, vi } from 'vitest'
import { HttpSessionStore, session } from '@bluish/http/session'
import BluishCoreTesting from '@bluish/core/testing'
import { Controller, Use } from '@bluish/core'
import { WS } from '../WebSocket.js'
import { WebSocketConnectedContext } from '../WebSocketContext.js'
import BluishHttpTesting from '@bluish/http/testing'
import { cookie } from '@bluish/http/cookie'
import http from '@bluish/http'

interface Session {}

class MemorySessionStore extends HttpSessionStore<Session> {
  public collection = new Map<string, Session>()

  public get(id: string) {
    return this.collection.get(id)
  }

  public set(id: string, session: Session) {
    this.collection.set(id, session)
  }

  public delete(id: string) {
    this.collection.delete(id)
  }
}

it('connected event allowed to http middlewares', async () => {
  const store = new MemorySessionStore()

  store.set('test', { username: 'johndoe' })

  @Controller
  @Use(http())
  @Use(cookie({ secret: 'super secret secret' }))
  @Use(session({ generateIdentifier: () => 'test', store }))
  class Root {
    public static connected(@WS.Connected context: WS.Connected) {}
  }

  vi.spyOn(Root, 'connected')

  const { request } = BluishHttpTesting.toContext('/')

  const context = await BluishCoreTesting.run(
    Root,
    'connected',
    new WebSocketConnectedContext({}, request),
  )

  console.log(context.response)

  expect(Root.connected).toHaveBeenCalledWith(
    expect.objectContaining({
      session: {
        username: 'johndoe',
      },
    }),
  )
})
