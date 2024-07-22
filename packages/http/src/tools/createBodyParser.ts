import { Middleware, Next } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'
import bytes from 'bytes'
import { is } from 'type-is'
import {
  BadRequest,
  HttpError,
  PayloadTooLarge,
  UnsupportedMediaType,
} from '../errors/HttpError.js'
import content from 'content-type'
import { Readable } from 'node:stream'

function getContentTypeCharset(type: string, defaultCharset = 'utf-8') {
  try {
    return content.parse(type)?.parameters?.charset ?? defaultCharset
  } catch {
    return defaultCharset
  }
}

export interface BodyParserOptions {
  limit?: string | number
  strict?: boolean
  strictContentLength?: boolean
}

export interface CreateBodyParserConfiguration<TOptions> {
  name: string
  accept: string | string[]
  defaultOptions?: TOptions
  parse(
    input: string,
    options: TOptions & BodyParserOptions,
    context: HttpContext,
  ): unknown
}

export function createBodyParser<TOptions>({
  name,
  accept,
  defaultOptions,
  parse: _parse,
}: CreateBodyParserConfiguration<TOptions & BodyParserOptions>) {
  const accepts = Array.isArray(accept) ? accept : [accept]

  function parse(
    options: TOptions & BodyParserOptions,
    input: string,
    context: HttpContext,
    next: Next,
  ) {
    context.request._body = context.request.body

    try {
      const value = _parse(input, options, context)

      if (typeof value === 'object' && value instanceof Promise)
        return value
          .then((value: any) => {
            context.request.body = value

            return next()
          })
          .catch(error => {
            if (error instanceof HttpError) return Promise.reject(error)

            return Promise.reject(
              new BadRequest(`Malformed ${name}`, { cause: error }),
            )
          })

      context.request.body = value
    } catch (error) {
      if (error instanceof HttpError) throw error

      throw new BadRequest(`Malformed ${name}`, { cause: error })
    }

    return next()
  }

  class BodyParserMiddleware extends Middleware<HttpContext> {
    public readonly context = [HttpContext]
    public readonly limit: number
    public readonly limitText: string

    constructor(
      public readonly options: TOptions & BodyParserOptions = {
        ...defaultOptions,
      } as TOptions & BodyParserOptions,
    ) {
      super()
      options.limit ??= '100kb'

      this.limit = bytes.parse(options.limit)

      this.limitText = bytes.format(this.limit)

      options.limit = this.limit
      options.strict ??= true
      options.strictContentLength ??= options.strict
    }

    public handle(context: HttpContext, next: Next): unknown {
      if (!context.request.body) return next()

      if (!context.request.headers['content-type']) return next()

      if (typeof context.request.headers['content-type'] !== 'string')
        return next()

      if (!is(context.request.headers['content-type'], accepts)) return next()

      if (context.request.headers['content-length'] === '0') return next()

      if (context.request._body) return next()

      if (
        this.options.strictContentLength &&
        !context.request.headers['content-length']
      )
        return next()

      if (this.limit >= 0 && context.request.headers['content-length']) {
        const length = parseInt(context.request.headers['content-length'], 10)

        if (isNaN(length)) throw new BadRequest('Invalid content length')

        if (length > this.limit)
          throw new PayloadTooLarge(
            `The request payload is too large. Maximum allowed size is ${this.limitText}.`,
          )
      }

      const charset = getContentTypeCharset(
        context.request.headers['content-type'],
        'utf-8',
      )

      if (!charset.startsWith('utf-'))
        throw new UnsupportedMediaType(
          `Unsupported charset "${charset.toUpperCase()}"`,
        )

      if (typeof context.request.body === 'string')
        return parse(this.options, context.request.body, context, next)

      if (typeof context.request.body !== 'object')
        throw new TypeError(
          `Unexpected body type: ${typeof context.request.body}`,
        )

      if (!(context.request.body instanceof Readable))
        throw new TypeError(
          `Unexpected body type: ${context.request.body.constructor.name}`,
        )

      const readable = context.request.body

      return new Promise((resolve, reject) => {
        const buffers: Buffer[] = []

        let received = 0

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this

        function onData(chunk: any) {
          const buffer = Buffer.from(chunk)

          received += buffer.length

          if (that.limit >= 0 && received > that.limit)
            return readable.destroy(
              new PayloadTooLarge(
                `The request payload is too large. Maximum allowed size is ${that.limitText}.`,
              ),
            )

          buffers.push(buffer)
        }

        function onError(error: Error) {
          reject(error)
        }

        function onAborted() {
          reject(new BadRequest('Aborted!'))
        }

        function onEnd() {
          const buffer = Buffer.concat(buffers)
          const text = buffer.toString()

          if (!text) return resolve(next())

          resolve(parse(that.options, text, context, next))
        }

        function onClose() {
          cleanup()
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

  Object.defineProperty(BodyParserMiddleware, 'name', {
    value: `${name[0].toUpperCase()}${name.slice(1)}BodyParserMiddleware`,
  })

  return (options?: TOptions & BodyParserOptions) =>
    new BodyParserMiddleware(options)
}
