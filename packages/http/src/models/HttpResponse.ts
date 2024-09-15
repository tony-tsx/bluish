import { Readable } from 'node:stream'

export enum HttpResponseStage {
  InProcessing = 0,
  HeaderSent = 500,
  Sent = 1000,
}

export class HttpResponse {
  public stage: number = 0

  public get headerSent() {
    return this.stage >= HttpResponseStage.HeaderSent
  }

  public get sent() {
    return this.stage >= HttpResponseStage.Sent
  }

  public status!: number

  public readonly headers: Record<string, undefined | string | string[]> = {}

  public body!: string | Buffer | Readable
}
