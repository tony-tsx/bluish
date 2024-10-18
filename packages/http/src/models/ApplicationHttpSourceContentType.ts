import {
  Application,
  ApplicationSource,
  ApplicationSourceAction,
  ApplicationSourceArgument,
  ApplicationSourceProperty,
  IUsable,
} from '@bluish/core'
import { HttpContext } from './HttpContext.js'
import { is } from 'type-is'
import { HTTP_CONTENT_TYPE } from '../constants/constants.js'
import { Readable } from 'node:stream'

export interface ApplicationHttpSourceContentTypeSerializerReturn {
  type?: string
  length?: number
  content: string | Buffer | Readable | Uint8Array | ArrayBuffer
}

export type ApplicationHttpSourceContentTypeSerializer = (
  error: unknown,
  payload: unknown,
  context: HttpContext,
) =>
  | ApplicationHttpSourceContentTypeSerializerReturn
  | Promise<ApplicationHttpSourceContentTypeSerializerReturn>

export interface ApplicationHttpSourceContentTypeConfiguration {
  contentType: string | string[]
  serializer: ApplicationHttpSourceContentTypeSerializer
  quality?: number
  q?: number
}

export class ApplicationHttpSourceContentType implements IUsable {
  public readonly serializer: ApplicationHttpSourceContentTypeSerializer

  public readonly contentType: string[]

  public readonly quality: number

  public is(accept: string | string[]): string | false {
    const accepts = Array.isArray(accept) ? accept : [accept]

    for (const contentType of this.contentType) {
      const type = is(contentType, accepts)

      if (type === false) continue

      return type
    }

    return false
  }

  constructor({
    contentType,
    serializer,
    q = 0.5,
    quality = q,
  }: ApplicationHttpSourceContentTypeConfiguration) {
    this.contentType = Array.isArray(contentType) ? contentType : [contentType]
    this.serializer = serializer
    this.quality = quality
  }
  use(
    target:
      | Application
      | ApplicationSource
      | ApplicationSourceAction
      | ApplicationSourceArgument
      | ApplicationSourceProperty,
  ): void {
    target.metadata.define(HTTP_CONTENT_TYPE, [this], (value, previous) =>
      previous.concat(value),
    )
  }

  public async set(
    defaultType: string,
    error: unknown | null,
    payload: unknown,
    context: HttpContext,
  ) {
    let { type, content, length } = await this.serializer(
      error,
      payload,
      context,
    )

    if (type === undefined) type = defaultType

    if (typeof content === 'string') content = Buffer.from(content)

    context.response.headers['Content-Type'] = type

    if (length === undefined)
      if (Buffer.isBuffer(content)) length = content.byteLength
      else if (content instanceof ArrayBuffer) length = content.byteLength
      else if (content instanceof Uint8Array) length = content.byteLength

    if (length !== undefined)
      context.response.headers['Content-Length'] = `${length}`

    context.response.body = content
  }
}
