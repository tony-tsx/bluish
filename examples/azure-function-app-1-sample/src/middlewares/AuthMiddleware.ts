import { Context, Middleware } from '@bluish/core';

export interface IToken {
  scopes: string[];
}

export class AuthMiddleware extends Middleware {
  constructor(public readonly getToken: (context: Context) => string[]) {
    super();
  }
}
