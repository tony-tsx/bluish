import { Argument } from '@bluish/core';

import { Request } from '../models/Request.js';

export const UseRequest = Argument(context => {
  if (!(context instanceof Request)) return null;

  return context;
});
