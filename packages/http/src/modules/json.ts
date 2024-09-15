import { IUsable, Use } from '@bluish/core'
import { ApplicationHttpSourceContentType } from '../http.js'
import { ApplicationHttpSourceAccept } from '../models/ApplicationHttpSourceAccept.js'
import { ApplicationHttpSourceAcceptSessionBufferAlloc } from '../models/ApplicationHttpSourceAcceptSessionBufferAlloc.js'

export class ApplicationHttpSourceAcceptSessionJson extends ApplicationHttpSourceAcceptSessionBufferAlloc {
  public toBody(): unknown | Promise<unknown> {
    return JSON.parse(this.buffer.toString('utf-8'))
  }
}

export interface ApplicationHttpSourceAcceptJsonOptions {
  accept?: string | string[]
  limit?: number | string
}

export class ApplicationHttpSourceAcceptJson extends ApplicationHttpSourceAccept {
  constructor({
    accept = ['application/json', 'application/*+json'],
    limit,
  }: ApplicationHttpSourceAcceptJsonOptions = {}) {
    super({
      accept,
      limit,
      charset: 'utf-',
      start: () => new ApplicationHttpSourceAcceptSessionJson(),
    })
  }
}

export interface ApplicationHttpSourceContentTypeJsonOptions {
  contentType?: string | string[]
}

export class ApplicationHttpSourceContentTypeJson extends ApplicationHttpSourceContentType {
  constructor({
    contentType = 'application/json',
  }: ApplicationHttpSourceContentTypeJsonOptions = {}) {
    super({
      contentType,
      serializer: (error, payload) => ({
        content: JSON.stringify(error ?? payload),
      }),
    })
  }
}

export interface JsonOptions extends ApplicationHttpSourceAcceptJsonOptions {}

export const json = (options?: JsonOptions): IUsable => ({
  use(target) {
    new ApplicationHttpSourceAcceptJson(options).use(target)
    new ApplicationHttpSourceContentTypeJson().use(target)
  },
})

json.accept = (options?: ApplicationHttpSourceAcceptJsonOptions) =>
  new ApplicationHttpSourceAcceptJson(options)

json.contentType = (options?: ApplicationHttpSourceContentTypeJsonOptions) =>
  new ApplicationHttpSourceContentTypeJson(options)

export const Json = (options?: JsonOptions) => Use(json(options))

Json.Accept = (options?: ApplicationHttpSourceAcceptJsonOptions) =>
  Use(new ApplicationHttpSourceAcceptJson(options))

Json.ContentType = (options?: ApplicationHttpSourceContentTypeJsonOptions) =>
  Use(new ApplicationHttpSourceContentTypeJson(options))