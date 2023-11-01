import { Use, Parameter } from '@bluish/core';
import { DataSource, ReplicationMode } from 'typeorm';

import { QueryRunnerMiddleware } from './QueryRunnerMiddleware.js';
import { QUERY_RUNNER } from './constants.js';

export function UseQueryRunner(dataSource: DataSource, mode?: ReplicationMode) {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    Use(new QueryRunnerMiddleware(dataSource, mode))(target, propertyKey);

    Parameter(context => context[QUERY_RUNNER])(target, propertyKey, parameterIndex);
  };
}
