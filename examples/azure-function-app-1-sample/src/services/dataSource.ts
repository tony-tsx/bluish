import path from 'path';

import { DataSource } from 'typeorm';

import { ROOT } from '../constants/dirs.js';

export const dataSource = new DataSource({
  type: 'sqljs',
  entities: [path.join(ROOT, 'entities', '*')],
  logger: 'advanced-console',
  logging: 'all',
  dropSchema: true,
  synchronize: true,
});
