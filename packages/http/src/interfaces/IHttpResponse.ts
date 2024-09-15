import { Readable } from 'node:stream'

export interface IHttpResponse {
  readonly headers: Record<string, undefined | string | string[]>

  status: number

  body?: string | Buffer | Readable

  [key: string]: any
  [key: number]: any
  [key: symbol]: any
}
