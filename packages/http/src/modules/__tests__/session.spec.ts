import { session, HttpSessionStore } from '../session.js'
import { cookie } from '../cookie.js'
import { beforeEach, expect, it, vi } from 'vitest'

import HttpTesting from '../testing.js'
import BluishCoreTesting from '@bluish/core/testing'

const { runMiddleware } = BluishCoreTesting

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

const store = new MemorySessionStore()

beforeEach(() => {
  store.collection.clear()
})

it('adds session in request response cookie', async () => {
  const context = HttpTesting.toContext()

  await runMiddleware(
    [
      cookie({ secret: 'secret' }),
      session({ store, generateIdentifier: () => 'test123' }),
    ],
    context,
  )

  expect(context.session).toBeDefined()
  expect(context.session).toEqual({})
  expect(context.response.headers['Set-Cookie']).toEqual([
    'sessionID=s%3Atest123.USwsQMmkMOIH3XIM4H3dhwoglGcPDwBJBi2XErHjjSs',
  ])
})

it('skip session middleware if session already definied', async () => {
  const generateIdentifier = vi.fn(() => 'test123')
  const context = HttpTesting.toContext()

  context.session = {}

  await runMiddleware(session({ store, generateIdentifier }), context)

  expect(generateIdentifier).not.toHaveBeenCalled()
})

it('throws an error if the cookie middleware is required', async () => {
  const context = HttpTesting.toContext()

  await expect(
    runMiddleware(
      session({ store, generateIdentifier: () => 'test123' }),
      context,
    ),
  ).rejects.toThrow('Cookie middleware is required')
})
