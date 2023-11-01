import { Event } from '@bluish/core';

import { Request } from '../models/Request.js';

export class HttpParamEvent extends Event {
  constructor(
    public readonly request: Request,
    public readonly name: string,
    public readonly parameterIndex: number,
    public value: any,
  ) {
    super();
  }
}
