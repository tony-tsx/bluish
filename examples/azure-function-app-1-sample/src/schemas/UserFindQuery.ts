import { IsSchema } from '@bluish/omac';

import { PaginationQuery } from './PaginationQuery.js';

@IsSchema()
export class UserFindQuery extends PaginationQuery {}
