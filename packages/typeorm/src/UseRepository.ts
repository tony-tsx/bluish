import { Argument } from '@bluish/core';
import { DataSource, EntityTarget } from 'typeorm';

export function UseRepository<Entity extends object>(dataSource: DataSource, entityTarget: EntityTarget<Entity>) {
  return Argument(() => dataSource.getRepository(entityTarget));
}
