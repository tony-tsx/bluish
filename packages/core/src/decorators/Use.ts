import { Middleware } from '../models/Middleware.js';
import { getMetadataArgsStorage } from '../tools/getMetadataArgsStorage.js';

export function Use(middleware: Middleware) {
  return (target: Object | Function, propertyKey?: string | symbol) => {
    getMetadataArgsStorage().args('middlewares', {
      target: typeof target === 'function' ? target : target.constructor,
      propertyKey,
      instance: middleware,
    });
  };
}
