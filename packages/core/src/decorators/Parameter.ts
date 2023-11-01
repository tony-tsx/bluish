import { Context } from '../models/Context.js';
import { getMetadataArgsStorage } from '../tools/getMetadataArgsStorage.js';

export function Parameter(getter: (context: Context) => unknown = context => context) {
  return (target: Object | Function, propertyKey: string | symbol, parameterIndex: number) => {
    getMetadataArgsStorage().args('parameters', {
      target: typeof target === 'object' ? target.constructor : target,
      propertyKey,
      parameterIndex,
      isStatic: typeof target === 'function',
      getter,
    });
  };
}
