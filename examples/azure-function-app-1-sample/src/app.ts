import path from 'path';

import { AzureFunctionAppDriver, AzureFunctionAppHttpInput, AzureFunctionAppTimerInput } from '@bluish/azure';
import { App } from '@bluish/core';
import { UrlEncoded, Json } from '@bluish/http';
import { DataSourceMiddleware } from '@bluish/typeorm';
import { DiskStorageMiddleware } from '@bluish/multipart';

import { ROOT } from './constants/project.js';
import { dataSource } from './services/dataSource.js';
import { HttpErrorMiddleware } from './middlewares/HttpErrorMiddleware.js';

export default new App({
  driver: new AzureFunctionAppDriver({
    inputs: [new AzureFunctionAppHttpInput(), new AzureFunctionAppTimerInput()],
  }),
  functions: [path.join(ROOT, 'controllers', '*')],
  middlewares: [
    new DataSourceMiddleware(dataSource),
    new DiskStorageMiddleware({ toUnlink: true }),
    new UrlEncoded(true),
    new Json(),
    new HttpErrorMiddleware(),
  ],
});
