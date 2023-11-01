import { Parameter } from '@bluish/core';
import { DataSource, EntityTarget } from 'typeorm';

export function UseRepository<Entity extends object>(dataSource: DataSource, entityTarget: EntityTarget<Entity>) {
  return Parameter(() => dataSource.getRepository(entityTarget));
}
