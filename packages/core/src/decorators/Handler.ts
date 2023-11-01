import { HandlerMetadataArgType } from '../metadata-args/HandlerMetadataArgs.js';
import { getMetadataArgsStorage } from '../tools/getMetadataArgsStorage.js';

export function Handler<TType extends HandlerMetadataArgType>(
  type: TType,
  options?: Bluish.HandlerMetadata & Bluish.HandlerMetadataArgMapByType[TType] & { name?: string },
) {
  return (target: Object | Function, propertyKey: string | symbol) => {
    getMetadataArgsStorage().args('handlers', {
      target: typeof target === 'object' ? target.constructor : target,
      propertyKey,
      type,
      isStatic: typeof target === 'function',
      ...options,
    });
  };
}
