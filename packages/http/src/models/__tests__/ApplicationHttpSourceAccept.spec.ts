import { expect, it } from 'vitest'
import {
  ApplicationHttpSourceAccept,
  ApplicationHttpSourceAcceptSession,
} from '../ApplicationHttpSourceAccept.js'
import BluishHttpTesting from '../../modules/testing.js'
import { Readable } from 'node:stream'

it('use with stream', async () => {
  class Session extends ApplicationHttpSourceAcceptSession {
    public readonly buffers: Buffer[] = []

    public on(buffer: Buffer): void {
      this.buffers.push(buffer)
    }

    public get(): unknown | Promise<unknown> {
      return Buffer.concat(this.buffers).toString('utf-8')
    }
  }

  const accept = new ApplicationHttpSourceAccept({
    accept: 'text/plain',
    start: () => new Session(),
  })

  const readable = new Readable({
    read() {},
  })

  let message = 'Hello, World!'

  const context = BluishHttpTesting.toContext({ body: readable })

  const chunk = message.slice(0, 2)
  message = message.slice(2)

  readable.push(chunk)

  const content = accept.parse(context)

  while (message.length) {
    const chunk = message.slice(0, 2)
    message = message.slice(2)

    readable.push(chunk)

    await new Promise(resolve => setTimeout(resolve, 10))
  }

  readable.push(null)

  expect(content).resolves.toBe('Hello, World!')
})
