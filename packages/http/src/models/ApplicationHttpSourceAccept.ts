import { HttpContext } from './HttpContext.js'
import { is } from 'type-is'
import bytes from 'bytes'
import { Readable } from 'node:stream'
import { BadRequest, PayloadTooLarge } from '../errors/HttpError.js'
import {
  Application,
  ApplicationSource,
  ApplicationSourceAction,
  ApplicationSourceArgument,
  ApplicationSourceProperty,
  IUsable,
} from '@bluish/core'
import { HTTP_ACCEPT } from '../constants/constants.js'

export abstract class ApplicationHttpSourceAcceptSession {
  public readonly context!: HttpContext

  public abstract on(buffer: Buffer): void

  public abstract get(): unknown | Promise<unknown>

  public destroy?(): void
}

export interface ApplicationHttpSourceAcceptConfiguration {
  accept: string | string[]
  charset?: string
  limit?: number | string
  priority?: number
  start(context: HttpContext): ApplicationHttpSourceAcceptSession
}

export class ApplicationHttpSourceAccept implements IUsable {
  #start: (context: HttpContext) => ApplicationHttpSourceAcceptSession

  public readonly accept: string[]

  public readonly charset: string

  public readonly limit: number

  public readonly piority: number

  constructor({
    accept,
    limit = Infinity,
    charset = 'utf-',
    priority = 0,
    start,
  }: ApplicationHttpSourceAcceptConfiguration) {
    this.accept = Array.isArray(accept) ? accept : [accept]

    if (typeof limit === 'string') this.limit = bytes.parse(limit)
    else this.limit = limit

    this.charset = charset

    this.piority = priority

    this.#start = start
  }

  public use(
    target:
      | Application
      | ApplicationSource
      | ApplicationSourceAction
      | ApplicationSourceArgument
      | ApplicationSourceProperty,
  ): void {
    target.metadata.define(HTTP_ACCEPT, [this], (value, previous) =>
      previous.concat(value),
    )
  }

  public is(contentType: string): boolean {
    return !!is(contentType, this.accept)
  }

  public assert(contentLength: number): void {
    if (contentLength > this.limit)
      throw new PayloadTooLarge(
        `The request payload is too large. Maximum allowed size is ${bytes.format(this.limit)}.`,
      )
  }

  public start(context: HttpContext): ApplicationHttpSourceAcceptSession {
    const session = this.#start(context)

    Object.defineProperty(session, 'context', {
      value: context,
      enumerable: false,
      writable: false,
      configurable: false,
    })

    return session
  }

  public parse(context: HttpContext): unknown | Promise<unknown> {
    if (typeof context.request.body === 'string')
      context.request.body = Buffer.from(context.request.body)

    if (typeof context.request.body !== 'object')
      throw new TypeError(
        `Unexpected body type: ${typeof context.request.body}`,
      )

    if (context.request.body instanceof Buffer) {
      this.assert(context.request.body.byteLength)

      const session = this.start(context)

      session.on(context.request.body)

      return session
    }

    if (!(context.request.body instanceof Readable))
      throw new TypeError(
        `Unexpected body type: ${context.request.body.constructor.name}`,
      )

    const readable = context.request.body

    return new Promise((resolve, reject) => {
      const session = this.start(context)

      let length = 0

      const onData = (chunk: any) => {
        const buffer = Buffer.from(chunk)

        length += buffer.byteLength

        this.assert(length)

        session.on(buffer)
      }

      function onError(error: Error) {
        reject(error)
      }

      function onAborted() {
        reject(new BadRequest('Aborted!'))
      }

      function onEnd() {
        resolve(session.get())
      }

      function onClose() {
        cleanup()
        session.destroy?.()
      }

      function cleanup() {
        readable.off('data', onData)
        readable.off('error', onError)
        readable.off('aborted', onAborted)
        readable.off('end', onEnd)
        readable.off('close', onClose)
      }

      readable.on('data', onData)
      readable.on('error', onError)
      readable.on('aborted', onAborted)
      readable.on('end', onEnd)
      readable.on('close', onClose)
    })
  }
}
