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

export interface ApplicationHttpSourceContentTypeSerializerReturn {
  type?: string
  length?: number
  content: string | Buffer
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

  public async add(
    type: string,
    error: unknown | null,
    payload: unknown,
    context: HttpContext,
  ) {
    const data = await this.serializer(error, payload, context)

    if (data.type === undefined) data.type = type

    context.response.headers['Content-Type'] = data.type

    if (data.length === undefined) {
      if (typeof data.content === 'string') data.length = data.content.length
      else data.length = data.content.byteLength
    }

    context.response.headers['Content-Length'] = `${data.length}`

    context.response.body = data.content
  }
}
