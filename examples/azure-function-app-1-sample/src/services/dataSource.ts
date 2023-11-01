import path from 'path';

import { DataSource } from 'typeorm';

import { ROOT } from '../constants/project.js';

export const dataSource = new DataSource({
  type: 'sqljs',
  entities: [path.join(ROOT, 'entities', '*')],
  dropSchema: true,
  synchronize: true,
});
