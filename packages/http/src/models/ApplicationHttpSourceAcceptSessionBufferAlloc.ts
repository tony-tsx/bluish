import { ApplicationHttpSourceAcceptSession } from './ApplicationHttpSourceAccept.js'
import { BadRequest } from '../errors/HttpError.js'

export abstract class ApplicationHttpSourceAcceptSessionBufferAlloc extends ApplicationHttpSourceAcceptSession {
  public buffer: Buffer = Buffer.alloc(0)

  public on(buffer: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, buffer])
  }

  protected toError(error: unknown): void
  protected toError() {
    throw new BadRequest('The request body is malformed')
  }

  protected abstract toBody(buffer: Buffer): unknown | Promise<unknown>

  public get(): unknown | Promise<unknown> {
    if (!this.buffer.length) return undefined

    try {
      return this.toBody(this.buffer)
    } catch (error) {
      return this.toError(error)
    }
  }

  public destroy(): void {
    this.buffer = Buffer.alloc(0)
  }
}
