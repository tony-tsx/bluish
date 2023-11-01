import { Use } from '@bluish/core';
import { DataSource } from 'typeorm';

import { DataSourceMiddleware } from './DataSourceMiddleware.js';

export function UseDataSource(dataSource: DataSource) {
  return Use(new DataSourceMiddleware(dataSource));
}
