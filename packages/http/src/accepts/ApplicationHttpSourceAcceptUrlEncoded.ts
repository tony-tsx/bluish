import { ApplicationHttpSourceAccept } from '../models/ApplicationHttpSourceAccept.js'
import { ApplicationHttpSourceAcceptSessionBufferAlloc } from '../models/ApplicationHttpSourceAcceptSessionBufferAlloc.js'
import qs from 'qs'
import nodeqs from 'node:querystring'

export class ApplicationHttpSourceAcceptUrlEncodedSession extends ApplicationHttpSourceAcceptSessionBufferAlloc {
  constructor(public readonly extended: boolean) {
    super()
  }

  public toBody(): unknown | Promise<unknown> {
    const text = this.buffer.toString('utf-8')

    if (this.extended) return qs.parse(text)

    return nodeqs.parse(text)
  }
}

export interface ApplicationHttpSourceAcceptUrlEncodedOptions {
  extended?: boolean
  accept?: string | string[]
  limit?: number | string
}

export class ApplicationHttpSourceAcceptUrlEncoded extends ApplicationHttpSourceAccept {
  public readonly extended: boolean

  constructor({
    extended = false,
    accept = [
      'application/x-www-form-urlencoded',
      'application/*+x-www-form-urlencoded',
    ],
    limit,
  }: ApplicationHttpSourceAcceptUrlEncodedOptions = {}) {
    super({
      accept,
      limit,
      charset: 'utf-',
      start: () =>
        new ApplicationHttpSourceAcceptUrlEncodedSession(this.extended),
    })

    this.extended = extended
  }
}
