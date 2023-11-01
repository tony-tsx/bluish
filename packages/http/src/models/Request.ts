import { URL } from 'url';

import { Context } from '@bluish/core';

import { Headers } from './Headers.js';

export class Request extends Context {
  private _headers: Headers = new Headers();

  private _url!: URL;

  public get url(): URL {
    if (!this._url) throw new Error('TODO');

    return this._url;
  }

  public set url(url: string) {
    this._url = new URL(url);
  }

  public params!: Record<string, unknown>;

  public query!: Record<string, unknown>;

  public get headers(): Headers {
    return this._headers;
  }

  public set headers(raw: Record<string, string>) {
    Object.entries(raw).forEach(([name, value]) => {
      this._headers.set(name, value);
    });
  }

  public body!: unknown;
}
