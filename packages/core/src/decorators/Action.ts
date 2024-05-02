import { ActionMetadataArgType } from '../metadata-args/ActionMetadataArgs.js';
import { getMetadataArgsStorage } from '../tools/getMetadataArgsStorage.js';

export function Action<TType extends ActionMetadataArgType>(
  type: TType,
  options?: Bluish.ActionMetadataArgMapByType[TType] & { name?: string },
) {
  return (target: object | Function, propertyKey: string | symbol) => {
    getMetadataArgsStorage().args('actions', {
      target,
      propertyKey,
      type,
      ...options,
    });
  };
}
