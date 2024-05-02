import { Use, Argument } from '@bluish/core';
import { DataSource, EntityManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel.js';

import { TransactionMiddleware } from './TransactionMiddleware.js';
import { QUERY_RUNNER } from './constants.js';

export interface Transaction extends EntityManager {}

export function UseTransaction(dataSource: DataSource, isolationLevel?: IsolationLevel) {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    Use(new TransactionMiddleware(dataSource, isolationLevel))(target, propertyKey);

    Argument(context => context[QUERY_RUNNER].manager)(target, propertyKey, parameterIndex);
  };
}
