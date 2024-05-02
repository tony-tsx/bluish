import { Context, getMetadataArgsStorage } from '../index.js';

export function Wrap(fn: (fn: () => unknown, context: Context) => unknown) {
  return function (target: Function | object, propertyKey?: string | symbol) {
    getMetadataArgsStorage().args('wrappers').push({
      target,
      propertyKey,
      wrapper: fn,
    });
  };
}
