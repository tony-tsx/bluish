export interface IHttpResponse {
  readonly headers: Record<string, undefined | string | string[]>

  status: number

  body?: any

  [key: string]: any
  [key: number]: any
  [key: symbol]: any
}
