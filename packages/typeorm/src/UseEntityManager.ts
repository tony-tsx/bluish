import { Parameter } from '@bluish/core';
import { DataSource } from 'typeorm';

export function UseEntityManager(dataSource: DataSource) {
  return Parameter(() => dataSource.manager);
}
