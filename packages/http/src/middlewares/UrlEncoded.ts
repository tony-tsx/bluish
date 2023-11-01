import { Readable } from 'stream';

import { BeforeHandlerExecuteEvent, Middleware } from '@bluish/core';
import { is } from 'type-is';

import { Request } from '../models/Request.js';

import type { ParseOptions } from 'querystring';
import type { IParseOptions } from 'qs';

export interface UrlEncodedExtendedOptions extends IParseOptions {}

export interface UrlEncodedNonExtendedOptions extends ParseOptions {
  sep?: string;
  eq?: string;
}

export class UrlEncoded extends Middleware {
  public readonly extended: boolean;

  public readonly options: UrlEncodedExtendedOptions | UrlEncodedNonExtendedOptions;

  constructor(extended: true, options?: UrlEncodedExtendedOptions);
  constructor(extended?: false, options?: UrlEncodedNonExtendedOptions);
  constructor(options?: UrlEncodedNonExtendedOptions);
  constructor(
    extendedOrNonExtendedOptions: boolean | UrlEncodedNonExtendedOptions = false,
    maybeOptions?: UrlEncodedExtendedOptions | UrlEncodedNonExtendedOptions,
  ) {
    super();

    if (typeof extendedOrNonExtendedOptions === 'object') {
      this.extended = true;
      this.options = extendedOrNonExtendedOptions;
    } else {
      this.extended = extendedOrNonExtendedOptions;
      this.options = maybeOptions ?? {};
    }
  }

  protected async parse(raw: string) {
    if (!this.extended) {
      const queryString = await import('querystring');

      const opts = this.options as UrlEncodedNonExtendedOptions;

      return queryString.parse(raw, opts.sep, opts.eq, {});
    }

    const qs = await import('qs');

    return qs.parse(raw, this.options as UrlEncodedExtendedOptions);
  }

  protected async parseQuery(request: Request): Promise<void> {
    request.query = await this.parse(request.url.search.replace(/^\?/, ''));
  }

  protected async parseBody(request: Request): Promise<void> {
    const contentType = request.headers.get('content-type');

    if (!contentType) return;

    if (!is(contentType, '*/x-www-form-urlencoded')) return;

    if (typeof request.body === 'string') {
      request.body = await this.parse(request.body);

      return;
    }

    if (typeof request.body !== 'object') return;

    const body = request.body;

    if (!(body instanceof Readable)) return;

    await new Promise<void>((resolve, reject) => {
      body.once('error', error => reject(error));
      body.once('readable', () => {
        const buffers: Buffer[] = [];

        body.on('data', chunk => {
          buffers.push(Buffer.from(chunk));
        });

        body.once('end', async () => {
          request.body = await this.parse(Buffer.concat(buffers).toString('utf-8'));
          resolve();
        });
      });
    });
  }

  public async onBefore(event: BeforeHandlerExecuteEvent): Promise<void> {
    if (!(event.context instanceof Request)) return;

    await Promise.all([this.parseBody(event.context), this.parseQuery(event.context)]);
  }
}
