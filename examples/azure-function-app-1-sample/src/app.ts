import path from 'path';

import { Application } from '@bluish/core';
import { UrlEncoded, Json, Request } from '@bluish/http';
import { DataSourceMiddleware } from '@bluish/typeorm';
import { DiskStorageMiddleware } from '@bluish/multipart';
import { OnCatchValidationErrorMiddleware } from '@bluish/ornate-guard';
import { AzureFunctionAppDriver } from '@bluish/azure-function-app';
import { AzureFunctionAppHttpInput } from '@bluish/azure-function-app/http';
import { AzureFunctionAppTimerInput } from '@bluish/azure-function-app/timer';
import { AzureFunctionAppServiceBusInput } from '@bluish/azure-function-app/service-bus';

import { ROOT } from './constants/project.js';
import { dataSource } from './services/dataSource.js';
import { HttpErrorMiddleware } from './middlewares/HttpErrorMiddleware.js';
import { toObject } from './tools/toObject.js';
import { AuthMiddleware } from './middlewares/AuthMiddleware.js';

export default new Application({
  driver: new AzureFunctionAppDriver({
    inputs: [
      new AzureFunctionAppHttpInput(),
      new AzureFunctionAppTimerInput(),
      new AzureFunctionAppServiceBusInput('SERVICE_BUS_CONNECTION_STRING'),
    ],
  }),
  controllers: [path.join(ROOT, 'controllers', '*')],
  middlewares: [
    new DataSourceMiddleware(dataSource),
    new DiskStorageMiddleware({ toUnlink: true }),
    new UrlEncoded(true),
    new Json(),
    new HttpErrorMiddleware(),
    new AuthMiddleware(() => {
      return [];
      // if (!(context instanceof Request)) return [];
      // const authorization = context.headers.get('authorization');
      // // .. throw new Forbidden('')
      // declare const token: any;
      // return token.scopes;
    }),
    new OnCatchValidationErrorMiddleware((error, event) => {
      if (!(event.context instanceof Request)) return;

      event.prevent({
        status: 400,
        body: { errors: toObject(error) },
      });
    }),
  ],
});
