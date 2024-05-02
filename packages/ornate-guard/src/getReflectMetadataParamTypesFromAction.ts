import { ActionMetadata } from '@bluish/core';

import { getReflectMetadataParamTypesFromAction } from './getReflectMetadataParamTypeFromAction.js';

export function getReflectMetadataParamTypeFromAction(action: ActionMetadata, parameterIndex: number) {
  return getReflectMetadataParamTypesFromAction(action)[parameterIndex];
}
