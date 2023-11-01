import { Parameter } from '@bluish/core';

import { Request } from '../models/Request.js';

export const UseRequest = Parameter(context => {
  if (!(context instanceof Request)) return null;

  return context;
});
