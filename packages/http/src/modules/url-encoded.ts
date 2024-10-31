import { ApplicationHttpSourceAccept } from '../models/ApplicationHttpSourceAccept.js'
import { ApplicationHttpSourceAcceptSessionBufferAlloc } from '../models/ApplicationHttpSourceAcceptSessionBufferAlloc.js'
import qs from 'qs'
import nodeqs from 'node:querystring'
import {
  Application,
  ApplicationSource,
  ApplicationSourceAction,
  ApplicationSourceArgument,
  ApplicationSourceProperty,
  Context,
  IUsable,
  Middleware,
  Use,
} from '@bluish/core'
import { ApplicationHttpSourceContentType, HttpContext } from '../http.js'

export class ApplicationHttpSourceAcceptUrlEncodedSession extends ApplicationHttpSourceAcceptSessionBufferAlloc {
  constructor(public readonly extended: boolean) {
    super()
  }

  public toBody(): unknown | Promise<unknown> {
    const text = this.buffer.toString('utf-8')

    if (this.extended) return qs.parse(text)

    return nodeqs.parse(text)
  }
}

export interface ApplicationHttpSourceAcceptUrlEncodedOptions {
  extended?: boolean
  accept?: string | string[]
  limit?: number | string
}

export class ApplicationHttpSourceAcceptUrlEncoded extends ApplicationHttpSourceAccept {
  static readonly #qs = Middleware.from(HttpContext, (context, next) => {
    context.request.query = qs.parse(context.request.self.search.slice(1))

    return next()
  }) as unknown as Middleware<Context>

  public readonly extended: boolean

  constructor({
    extended = false,
    accept = [
      'application/x-www-form-urlencoded',
      'application/*+x-www-form-urlencoded',
    ],
    limit,
  }: ApplicationHttpSourceAcceptUrlEncodedOptions = {}) {
    super({
      accept,
      limit,
      charset: 'utf-',
      start: () =>
        new ApplicationHttpSourceAcceptUrlEncodedSession(this.extended),
    })

    this.extended = extended
  }

  public use(
    target:
      | Application
      | ApplicationSource
      | ApplicationSourceAction
      | ApplicationSourceArgument
      | ApplicationSourceProperty,
  ): void {
    if (!this.extended) return super.use(target)

    if (!('middlewares' in target)) return

    target.middlewares.add(ApplicationHttpSourceAcceptUrlEncoded.#qs)
  }
}

export interface ApplicationHttpSourceContentTypeUrlEncodedOptions {
  extended?: boolean
  contentType?: string | string[]
  quality?: number
  q?: number
}

export class ApplicationHttpSourceContentTypeUrlEncoded extends ApplicationHttpSourceContentType {
  constructor({
    extended = false,
    contentType = 'application/x-www-form-urlencoded',
    quality,
    q,
  }: ApplicationHttpSourceContentTypeUrlEncodedOptions = {}) {
    super({
      contentType,
      quality,
      q,
      serializer: (error, payload) => {
        const content = (error ?? payload) as any

        return {
          content: extended ? qs.stringify(content) : nodeqs.stringify(content),
        }
      },
    })
  }
}

export interface UrlEncodedOptions
  extends ApplicationHttpSourceAcceptUrlEncodedOptions {}

export const urlEncoded = (options?: UrlEncodedOptions): IUsable => ({
  use(target) {
    new ApplicationHttpSourceAcceptUrlEncoded(options).use(target)
    new ApplicationHttpSourceContentTypeUrlEncoded(options).use(target)
  },
})

export const UrlEncoded = (options?: UrlEncodedOptions) =>
  Use(urlEncoded(options))

UrlEncoded.ContentType = (
  options?: ApplicationHttpSourceContentTypeUrlEncodedOptions,
) => Use(new ApplicationHttpSourceContentTypeUrlEncoded(options))

UrlEncoded.Accept = (options?: ApplicationHttpSourceAcceptUrlEncodedOptions) =>
  Use(new ApplicationHttpSourceAcceptUrlEncoded(options))
