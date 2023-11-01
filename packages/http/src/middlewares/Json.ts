import { Readable } from 'stream';

import { BeforeHandlerExecuteEvent, Middleware } from '@bluish/core';
import { is } from 'type-is';

import { Request } from '../models/Request.js';

export interface JsonOptions {
  limit?: number;
}

export class Json extends Middleware {
  constructor(public readonly options: JsonOptions = {}) {
    super();
  }

  public async onBefore(event: BeforeHandlerExecuteEvent): Promise<void> {
    if (!(event.context instanceof Request)) return;

    const request = event.context;

    const contentType = request.headers.get('content-type');

    if (!contentType) return;

    if (!is(contentType, '*/json')) return;

    if (typeof this.options.limit === 'number') {
      const contentLength = event.context.headers.get('content-length');

      if (!contentLength) return event.prevent({ status: 411 });

      if (Number(contentLength) > this.options.limit) return event.prevent({ status: 413 });
    }

    if (typeof request.body !== 'object') return;

    if (!(request.body instanceof Readable)) return;

    const readable = request.body;

    const buffers: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      readable.once('readable', () => {
        readable.on('data', chunk => buffers.push(Buffer.from(chunk)));

        readable.on('end', () => {
          request.body = JSON.parse(Buffer.concat(buffers).toString('utf-8'));

          resolve();
        });
      });

      readable.once('error', error => reject(error));
    });
  }
}
