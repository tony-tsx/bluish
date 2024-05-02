import { Argument } from '@bluish/core';

import { Request } from '../models/Request.js';

export const UseHeaders = Argument(context => (context instanceof Request ? context.headers : null));
