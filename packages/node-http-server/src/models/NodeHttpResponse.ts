import { HttpContext, IHttpResponse } from '@bluish/http'
import http from 'node:http'
import { Readable } from 'stream'
import { NodeHttpRequest } from './NodeHttpRequest.js'
import { Injectable } from '@bluish/core'

export class NodeHttpResponse<
    TRequest extends NodeHttpRequest = NodeHttpRequest,
  >
  extends http.ServerResponse<TRequest>
  implements IHttpResponse
{
  #body: string | Readable | Buffer | undefined

  public readonly headers: Record<string, string | string[] | undefined> = {}

  public get status() {
    return this.statusCode
  }

  public set status(value: number) {
    this.statusCode = value
  }

  public get body() {
    return this.#body
  }

  public set body(value: string | Readable | Buffer | undefined) {
    this.#body = value

    if (!(this.#body instanceof Readable)) return

    this.writeHead(this.statusCode, this.headers)
    this.#body.pipe(this)
  }

  [key: number]: any
  [key: string]: any
}

Injectable.register(NodeHttpResponse, 'context', context => {
  if (context instanceof HttpContext) return context.response
})
