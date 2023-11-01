import { Event } from '@bluish/core';

import { Request } from '../models/Request.js';

export class HttpQueryEvent extends Event {
  constructor(
    public readonly request: Request,
    public readonly parameterIndex: number,
    public value: any,
  ) {
    super();
  }
}
