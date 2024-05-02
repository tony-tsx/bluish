import { Context } from '../models/Context.js';
import { getMetadataArgsStorage } from '../tools/getMetadataArgsStorage.js';

export function Argument(getter: (context: Context) => unknown = context => context) {
  return (target: Object | Function, propertyKey: string | symbol, parameterIndex: number) => {
    getMetadataArgsStorage().args('arguments', {
      target,
      propertyKey,
      parameterIndex,
      getter,
    });
  };
}
