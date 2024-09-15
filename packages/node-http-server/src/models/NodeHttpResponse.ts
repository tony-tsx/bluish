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
  public readonly headers: Record<string, string | string[] | undefined> = {}

  public get status() {
    return this.statusCode
  }

  public set status(value: number) {
    this.statusCode = value
  }

  body?: string | Readable | Buffer | undefined;

  [key: number]: any
  [key: string]: any
}

Injectable.register(NodeHttpResponse, 'context', context => {
  if (context instanceof HttpContext) return context.response
})
