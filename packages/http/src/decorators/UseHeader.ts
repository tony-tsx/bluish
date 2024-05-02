import { Argument } from '@bluish/core';

import { Request } from '../models/Request.js';

export function UseHeader(name: string) {
  return Argument(context => (context instanceof Request ? context.headers.get(name) : null));
}
