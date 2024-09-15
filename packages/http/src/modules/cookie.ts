import { Class, Injectable, Input, Middleware } from '@bluish/core'
import querystring from 'node:querystring'
import crypto from 'node:crypto'
import { HttpContext } from '../models/HttpContext.js'

export type HttpCookieItemSameSite =
  | 'strict'
  | 'Strict'
  | 'lax'
  | 'Lax'
  | 'none'
  | 'None'
  | null
  | undefined

export interface HttpCookieItemOptions {
  domain?: string | null
  path?: string | null
  maxAge?: number | null
  expires?: Date | null
  secure?: boolean | null
  httpOnly?: boolean | null
  sameSite?: HttpCookieItemSameSite
}

export interface HttpCookieItem extends HttpCookieItemOptions {
  name: string
  value: string
}

export interface HttpCookieOptions
  extends Omit<HttpCookieItemOptions, 'expires'> {
  secret?: string | string[]
  defaultSecret?: string
}

const HTTP_COOKIE_CONFIG = Symbol()

const HTTP_COOKIE_SIGN = Symbol()

const HTTP_COOKIE_VERIFY = Symbol()

const HTTP_COOKIE_SIGNED = Symbol()

export class HttpCookie {
  private readonly [HTTP_COOKIE_CONFIG] = {
    secrets: [] as string[],
    defaultSecret: undefined as string | null | undefined,
    domain: undefined as string | null | undefined,
    path: undefined as string | null | undefined,
    maxAge: undefined as number | null | undefined,
    httpOnly: undefined as boolean | null | undefined,
    secure: undefined as boolean | null | undefined,
    sameSite: null as HttpCookieItemSameSite,
  }

  private readonly [HTTP_COOKIE_SIGNED] = new Set<string>()

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
    }: HttpCookieOptions,
  ) {
    if (secret)
      if (Array.isArray(secret)) this[HTTP_COOKIE_CONFIG].secrets = secret
      else this[HTTP_COOKIE_CONFIG].secrets = [secret]

    if (defaultSecret !== undefined)
      this[HTTP_COOKIE_CONFIG].defaultSecret = defaultSecret
    else if (typeof secret === 'string')
      this[HTTP_COOKIE_CONFIG].defaultSecret = secret

    this[HTTP_COOKIE_CONFIG].domain = domain ?? null
    this[HTTP_COOKIE_CONFIG].path = path ?? null
    this[HTTP_COOKIE_CONFIG].maxAge = maxAge ?? null
    this[HTTP_COOKIE_CONFIG].httpOnly = httpOnly ?? null
    this[HTTP_COOKIE_CONFIG].sameSite = sameSite ?? null
    this[HTTP_COOKIE_CONFIG].secure = secure ?? null

    if (!context.request.headers.cookie) return this

    for (const cookie of context.request.headers.cookie.split(';')) {
      const [name, ...rest] = cookie.split(`=`)

      const key = name?.trim()

      if (!key) continue

      let value = rest.join(`=`).trim()

      if (!value) continue

      value = querystring.unescape(value)

      if (value.startsWith(`s:`)) {
        const _value = this[HTTP_COOKIE_VERIFY](value.slice(2))

        if (_value === false) continue

        this[HTTP_COOKIE_SIGNED].add(key)

        value = _value
      }

      this[key] = value
    }
  }

  private [HTTP_COOKIE_SIGN](value: string, secret: string) {
    return crypto.createHmac('sha256', secret).update(value).digest('base64url')
  }

  private [HTTP_COOKIE_VERIFY](value: string) {
    const _value = value.slice(0, value.lastIndexOf('.'))
    const _sig = value.slice(value.lastIndexOf('.') + 1)

    for (const secret of this[HTTP_COOKIE_CONFIG].secrets) {
      const sig = this[HTTP_COOKIE_SIGN](_value, secret)

      const expected = Buffer.from(_sig)
      const input = Buffer.from(sig)

      if (expected.length !== input.length) continue

      if (!crypto.timingSafeEqual(expected, input)) continue

      return _value
    }

    return false
  }

  public isSigned(name: string) {
    return this[HTTP_COOKIE_SIGNED].has(name)
  }

  public sign(
    name: string,
    value: string,
    secret: string | undefined | null = this[HTTP_COOKIE_CONFIG].defaultSecret,
    options?: HttpCookieItemOptions,
  ) {
    if (!secret) throw new Error('TODO')

    if (!this[HTTP_COOKIE_CONFIG].secrets.includes(secret))
      throw new Error('TODO')

    this.set(
      name,
      `s:${value}.${this[HTTP_COOKIE_SIGN](value, secret)}`,
      options,
    )
  }

  public set(
    name: string,
    value: string,
    {
      expires,
      domain = this[HTTP_COOKIE_CONFIG].domain,
      path = this[HTTP_COOKIE_CONFIG].path,
      httpOnly = this[HTTP_COOKIE_CONFIG].httpOnly,
      maxAge = this[HTTP_COOKIE_CONFIG].maxAge,
      secure = this[HTTP_COOKIE_CONFIG].secure,
      sameSite = this[HTTP_COOKIE_CONFIG].sameSite,
    }: Omit<HttpCookieItem, 'name' | 'value'> = {},
  ) {
    const cookie = [`${name}=${querystring.escape(value)}`]

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

export function cookie(options: HttpCookieOptions = {}) {
  return Middleware.from(HttpContext, function (context, next) {
    context.cookie = new HttpCookie(context, options)

    return next()
  })
}

export function Cookie(
  target: object | Class,
  propertyKey: undefined | string | symbol,
  parameterIndex?: number,
): void
export function Cookie(
  name: string,
  onlySigned?: boolean,
): (
  target: object | Class,
  propertyKey: undefined | string | symbol,
  parameterIndex?: number,
) => void
export function Cookie(
  targetOrName: object | Class | string,
  maybePropertyKeyOrOnlySigned?: boolean | string | symbol,
  maybeParameterIndex?: number,
) {
  if (typeof targetOrName === 'string') {
    if (maybePropertyKeyOrOnlySigned === true)
      return Input(HttpContext, context => {
        return context.cookie[targetOrName]
      })
    return Input(HttpContext, context => context.cookie[targetOrName])
  }

  if (maybePropertyKeyOrOnlySigned === undefined)
    throw new TypeError('Cookie decorator must be used on a method parameter')

  if (maybeParameterIndex === undefined)
    throw new TypeError('Cookie decorator must be used on a method parameter')

  if (typeof maybePropertyKeyOrOnlySigned === 'boolean')
    throw new TypeError('Cookie decorator must be used on a method parameter')

  return Input(HttpContext, context => context.cookie)(
    targetOrName,
    maybePropertyKeyOrOnlySigned,
    maybeParameterIndex,
  )
}

declare global {
  namespace Bluish {
    interface HttpContext {
      cookie: HttpCookie
    }
  }
}

Injectable.register(
  HttpCookie,
  'context',
  (context: HttpContext) => context.cookie,
  HttpContext,
)
