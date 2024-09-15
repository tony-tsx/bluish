import http from 'node:http'
import net from 'node:net'
import { HttpContext, HttpMethod, IHttpRequest } from '@bluish/http'
import { Injectable } from '@bluish/core'

export class NodeHttpRequest
  extends http.IncomingMessage
  implements IHttpRequest
{
  // @ts-expect-error: TODO
  public override method!: HttpMethod

  public self!: URL

  public params: Record<string, any> = {}

  public query!: Record<string, any>

  public body: any

  constructor(socket: net.Socket) {
    super(socket)
  }

  [key: number]: any
  [key: string]: any
}

Injectable.register(NodeHttpRequest, 'context', context => {
  if (context instanceof HttpContext) return context.request
})
