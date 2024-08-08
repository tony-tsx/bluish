import { Argument, Class, Middleware } from '@bluish/core'
import querystring from 'node:querystring'
import crypto from 'node:crypto'
import { HttpContext } from '../models/HttpContext.js'

export type CookieItemSameSite =
  | 'strict'
  | 'Strict'
  | 'lax'
  | 'Lax'
  | 'none'
  | 'None'
  | null

export interface CookieItemOptions {
  domain?: string | null
  path?: string | null
  maxAge?: number | null
  expires?: Date | null
  secure?: boolean | null
  httpOnly?: boolean | null
  sameSite?: CookieItemSameSite
}

export interface CookieItem extends CookieItemOptions {
  key: string
  value: string
}

export interface CookieOptions extends Omit<CookieItemOptions, 'expires'> {
  secret?: string | string[]
  defaultSecret?: string
}

export class Cookie {
  private readonly _secrets: string[]

  private readonly _defaultSecret?: string | null

  private readonly _domain?: string | null

  private readonly _path?: string | null

  private readonly _maxAge?: number | null

  private readonly _httpOnly?: boolean | null

  private readonly _secure?: boolean | null

  private readonly _sameSite?: CookieItemSameSite

  constructor(
    public readonly context: HttpContext,
    {
      domain,
      path,
      maxAge,
      httpOnly,
      sameSite,
      secure,
      secret = [],
      defaultSecret,
    }: CookieOptions,
  ) {
    this._secrets = Array.isArray(secret) ? secret : [secret]

    this._defaultSecret = defaultSecret

    if (typeof secret === 'string') this._defaultSecret = secret

    this._domain = domain
    this._path = path
    this._maxAge = maxAge
    this._httpOnly = httpOnly
    this._sameSite = sameSite
    this._secure = secure

    if (!context.request.headers.cookie) return this

    for (const cookie of context.request.headers.cookie.split(';')) {
      const [name, ...rest] = cookie.split(`=`)

      const key = name?.trim()

      if (!key) continue

      let value = rest.join(`=`).trim()

      if (!value) continue

      value = querystring.unescape(value)

      if (value.startsWith(`s:`)) {
        const _value = this._verify(value.slice(2))

        if (_value === false) continue

        value = _value
      }

      this[key] = value
    }
  }

  private _sign(value: string, secret: string) {
    return crypto.createHmac('sha256', secret).update(value).digest('base64url')
  }

  private _verify(value: string) {
    const _value = value.slice(0, value.lastIndexOf('.'))
    const _sig = value.slice(value.lastIndexOf('.') + 1)

    for (const secret of this._secrets) {
      const sig = this._sign(_value, secret)

      const expected = Buffer.from(_sig)
      const input = Buffer.from(sig)

      if (expected.length !== input.length) continue

      if (!crypto.timingSafeEqual(expected, input)) continue

      return _value
    }

    return false
  }

  public sign(
    key: string,
    value: string,
    secret: string | undefined | null = this._defaultSecret,
    options?: CookieItemOptions,
  ) {
    if (!secret) throw new Error('TODO')

    if (!this._secrets?.includes(secret)) throw new Error('TODO')

    this.set(key, `s:${value}.${this._sign(value, secret)}`, options)
  }

  public set(
    key: string,
    value: string,
    {
      expires,
      domain = this._domain,
      path = this._path,
      httpOnly = this._httpOnly,
      maxAge = this._maxAge,
      secure = this._secure,
      sameSite = this._sameSite,
    }: Omit<CookieItem, 'key' | 'value'> = {},
  ) {
    const cookie = [`${key}=${querystring.escape(value)}`]

    if (domain) cookie.push(`Domain=${domain}`)

    if (path) cookie.push(`Path=${path}`)

    if (maxAge) cookie.push(`Max-Age=${maxAge}`)

    if (expires) cookie.push(`Expires=${expires.toUTCString()}`)

    if (httpOnly) cookie.push(`HttpOnly`)

    if (secure) cookie.push(`Secure`)

    if (sameSite) cookie.push(`SameSite=${sameSite}`)

    this.context.response.headers['Set-Cookie'] ??= []

    if (!Array.isArray(this.context.response.headers['Set-Cookie']))
      throw new Error('TODO')

    this.context.response.headers['Set-Cookie'].push(cookie.join('; '))
  }

  [key: string]: unknown
}

export function cookie(options: CookieOptions = {}) {
  return Middleware.from(HttpContext, function (context, next) {
    context.cookie = new Cookie(context, options)

    return next()
  })
}

declare global {
  namespace Bluish {
    interface HttpContext {
      cookie: Cookie
    }
  }
}

export function UseCookie(
  target: object | Class,
  propertyKey: string | symbol,
  parameterIndex: number,
): void
export function UseCookie(
  name: string,
): (
  target: object | Class,
  propertyKey: string | symbol,
  parameterIndex: number,
) => void
export function UseCookie(
  targetOrName: object | Class | string,
  maybePropertyKey?: string | symbol,
  maybeParameterIndex?: number,
) {
  if (typeof targetOrName === 'string')
    return Argument(HttpContext, context => context.cookie[targetOrName])

  if (maybePropertyKey === undefined)
    throw new TypeError(
      'UseCookie decorator must be used on a method parameter',
    )

  if (maybeParameterIndex === undefined)
    throw new TypeError(
      'UseCookie decorator must be used on a method parameter',
    )

  return Argument(HttpContext, context => context.cookie)(
    targetOrName,
    maybePropertyKey,
    maybeParameterIndex,
  )
}
