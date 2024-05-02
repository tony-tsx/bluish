import { Context, getMetadataArgsStorage } from '@bluish/core';

import { Token } from '../interfaces/Token.js';

export function ShieldTest(test: (token: Token, context: Context) => boolean) {
  return (target: Function | object, propertyKey: string | symbol) => {
    getMetadataArgsStorage().args('@shield:tests', { target, propertyKey, test });
  };
}
