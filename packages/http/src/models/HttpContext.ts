import { Context } from '@bluish/core'
import {
  HTTP_ACCEPT,
  HTTP_CONTEXT_ACTION_CONTENT_MIME_TYPE,
  HTTP_CONTEXT_ACTION_CONTENT_TYPE,
} from '../constants/constants.js'
import { ApplicationHttpSourceContentType } from './ApplicationHttpSourceContentType.js'
import { ApplicationHttpSourceAccept } from './ApplicationHttpSourceAccept.js'
import { IHttpRequest } from '../interfaces/IHttpRequest.js'
import { IHttpResponse } from '../interfaces/IHttpResponse.js'

export class HttpContext<
  TRequest extends IHttpRequest = IHttpRequest,
  TResponse extends IHttpResponse = IHttpResponse,
> extends Context {
  public [HTTP_CONTEXT_ACTION_CONTENT_TYPE]?: ApplicationHttpSourceContentType

  public [HTTP_CONTEXT_ACTION_CONTENT_MIME_TYPE]?: string

  public [HTTP_ACCEPT]?: ApplicationHttpSourceAccept

  constructor(
    public readonly request: TRequest,
    public readonly response: TResponse,
  ) {
    super()
  }
}

export interface HttpContext<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TRequest extends IHttpRequest = IHttpRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TResponse extends IHttpResponse = IHttpResponse,
> extends Bluish.HttpContext {}

declare global {
  namespace Bluish {
    interface HttpContext {}
  }
}
