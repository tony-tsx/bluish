import { Context, getMetadataArgsStorage } from '../index.js';

export function Wrapper(fn: (fn: () => unknown, context: Context) => unknown) {
  return function (target: Function | object, propertyKey?: string | symbol) {
    getMetadataArgsStorage()
      .args('wrappers')
      .push({
        target: typeof target === 'object' ? target.constructor : target,
        propertyKey,
        wrapper: fn,
      });
  };
}
