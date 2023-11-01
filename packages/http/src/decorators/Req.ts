import { Parameter } from '@bluish/core';

import { Request } from '../index.js';

export interface Req {
  (target: Object, propertyKey: string | symbol, parameterIndex: number): void;
  Body(target: Object, propertyKey: string | symbol, parameterIndex: number): void;
  Query(target: Object, propertyKey: string | symbol, parameterIndex: number): void;
}

export const Req = Parameter() as Req;

Req.Body = Parameter(context => (context instanceof Request ? context.body : null));

Req.Query = Parameter(context => (context instanceof Request ? context.query : null));
