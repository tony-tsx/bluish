import path from 'path';

import { AzureFunctionAppDriver, AzureFunctionAppHttpInput, AzureFunctionAppTimerInput } from '@bluish/azure';
import { App } from '@bluish/core';
import { UrlEncoded, Json, Request } from '@bluish/http';
import { DataSourceMiddleware } from '@bluish/typeorm';
import { DiskStorageMiddleware } from '@bluish/multipart';
import { OnValidationErrorMiddleware } from '@bluish/omac';

import { ROOT } from './constants/project.js';
import { dataSource } from './services/dataSource.js';
import { HttpErrorMiddleware } from './middlewares/HttpErrorMiddleware.js';
import { toObject } from './tools/toObject.js';

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
    new OnValidationErrorMiddleware((error, event) => {
      if (!(event.context instanceof Request)) return;

      event.prevent({
        status: 400,
        body: { errors: toObject(error) },
      });
    }),
  ],
});
