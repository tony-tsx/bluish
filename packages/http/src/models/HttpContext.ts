import { Context } from '@bluish/core'
import { HttpRequest } from './HttpRequest.js'
import { HttpResponse } from './HttpResponse.js'
import {
  HTTP_ACCEPT,
  HTTP_CONTEXT_ACTION_CONTENT_MIME_TYPE,
  HTTP_CONTEXT_ACTION_CONTENT_TYPE,
} from '../constants/constants.js'
import { ApplicationHttpSourceContentType } from './ApplicationHttpSourceContentType.js'
import { ApplicationHttpSourceAccept } from './ApplicationHttpSourceAccept.js'

export class HttpContext extends Context {
  public [HTTP_CONTEXT_ACTION_CONTENT_TYPE]?: ApplicationHttpSourceContentType

  public [HTTP_CONTEXT_ACTION_CONTENT_MIME_TYPE]?: string

  public [HTTP_ACCEPT]?: ApplicationHttpSourceAccept

  constructor(
    public readonly request: HttpRequest,
    public readonly response: HttpResponse,
  ) {
    super()
  }
}

export interface HttpContext extends Bluish.HttpContext {}

declare global {
  namespace Bluish {
    interface HttpContext {}
  }
}
