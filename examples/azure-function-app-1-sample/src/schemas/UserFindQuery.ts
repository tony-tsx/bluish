import { IsGuard } from '@bluish/ornate-guard';

import { PaginationQuery } from './PaginationQuery.js';

@IsGuard()
export class UserFindQuery extends PaginationQuery {}
