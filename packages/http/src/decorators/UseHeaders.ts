import { Parameter } from '@bluish/core';

import { Request } from '../models/Request.js';

export const UseHeaders = Parameter(context => (context instanceof Request ? context.headers : null));
