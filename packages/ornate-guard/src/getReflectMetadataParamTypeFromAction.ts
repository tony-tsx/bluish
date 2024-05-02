import { ActionMetadata } from '@bluish/core';

export function getReflectMetadataParamTypesFromAction(action: ActionMetadata) {
  return Reflect.getMetadata('design:paramtypes', action.target, action.propertyKey);
}
