import { Argument, Middleware } from '@bluish/core'
import { HttpContext, Request } from '@bluish/http'
import { Cookie, CookieItemOptions } from './cookie.js'

export abstract class SessionStore<TSession extends object> {
  public abstract get(
    id: string,
  ): TSession | null | undefined | Promise<TSession | null | undefined>

  public abstract set(id: string, session: TSession): void | Promise<void>

  public abstract delete(id: string): void | Promise<void>
}

export interface SessionOptions<TSession extends object>
  extends Omit<CookieItemOptions, 'expires'> {
  store: SessionStore<TSession>
  create?: () => TSession | Promise<TSession>
  key?: string
  renew?: boolean
  secret?: string
  generateIdentifier: (request: Request) => string
}

export function session<TSession extends object>({
  key = 'sessionID',
  renew = false,
  create = () => ({}) as TSession,
  secret,
  store,
  generateIdentifier,
  ...options
}: SessionOptions<TSession>) {
  return Middleware.from(HttpContext, async function session(context, next) {
    if (context.session) return next()

    if (!context.cookie) throw new Error('Cookie middleware is required')

    const cookie = context.cookie as Cookie

    let sessionID = cookie[key] as string | undefined

    sessionID ??= generateIdentifier(context.request)

    context.sessionID = sessionID

    if (!cookie[key]) cookie.sign(key, sessionID, secret, options)

    let session = await store.get(sessionID)

    if (!session) session = await create()

    context.session = session

    try {
      return await next()
    } finally {
      if (renew && cookie[key]) cookie.sign(key, sessionID, secret, options)

      await store.set(sessionID, session)
    }
  })
}

export const UseSession = Argument(HttpContext, context => context.session)

declare global {
  namespace Bluish {
    interface HttpSession {}

    interface HttpContext {
      sessionID: string
      session: HttpSession
    }
  }
}
