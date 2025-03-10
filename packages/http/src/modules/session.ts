import { Input, Middleware } from '@bluish/core'
import type { HttpCookieItemOptions } from './cookie.js'
import { HttpContext } from '../models/HttpContext.js'
import { IHttpRequest } from '../interfaces/IHttpRequest.js'

export abstract class HttpSessionStore<TSession extends object> {
  public abstract get(
    id: string,
    context: HttpContext,
  ): TSession | null | undefined | Promise<TSession | null | undefined>

  public abstract set(
    id: string,
    session: TSession,
    context: HttpContext,
  ): void | Promise<void>

  public abstract delete(id: string): void | Promise<void>
}

export interface HttpSessionOptions<TSession extends object>
  extends Omit<HttpCookieItemOptions, 'expires'> {
  store: HttpSessionStore<TSession>
  create?: () => TSession | Promise<TSession>
  key?: string
  renew?: boolean
  secret?: string
  generateIdentifier: (request: IHttpRequest) => string
}

export function session<TSession extends object>({
  key = 'sessionID',
  renew = false,
  create = () => ({}) as TSession,
  secret,
  store,
  generateIdentifier,
  ...options
}: HttpSessionOptions<TSession>) {
  return Middleware.from(HttpContext, async function session(context, next) {
    if (context.session) return next()

    if (!context.cookie) throw new Error('Cookie middleware is required')

    const cookie = context.cookie

    let sessionID = cookie.get(key, true)

    sessionID ??= generateIdentifier(context.request)

    context.sessionID = sessionID

    if (!cookie[key]) cookie.sign(key, sessionID, secret, options)

    let session = await store.get(sessionID, context)

    if (!session) session = await create()

    context.session = session

    try {
      return await next()
    } finally {
      if (renew && cookie[key]) cookie.sign(key, sessionID, secret, options)

      await store.set(sessionID, session, context)
    }
  })
}

export const Session = Input(HttpContext, context => context.session)

declare global {
  namespace Bluish {
    interface HttpSession {}

    interface HttpContext {
      sessionID: string
      session: HttpSession
    }
  }
}
