import { Event } from '@bluish/core';

import { Request } from '../models/Request.js';

export class HttpBodyEvent extends Event {
  constructor(
    public readonly request: Request,
    public readonly parameterIndex: number,
    public value: any,
  ) {
    super();
  }
}
