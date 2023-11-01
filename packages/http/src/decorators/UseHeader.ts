import { Parameter } from '@bluish/core';

import { Request } from '../models/Request.js';

export function UseHeader(name: string) {
  return Parameter(context => (context instanceof Request ? context.headers.get(name) : null));
}
