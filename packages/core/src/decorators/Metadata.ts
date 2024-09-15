import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Class } from '../typings/Class.js'

export function Metadata<T>(
  key: unknown,
  value: T | (() => T),
  reducer?: (value: T, previous: T) => T,
) {
  return (
    target: Class | object,
    propertyKey?: string | symbol,
    parameterIndexOrPropertyDescriptor?: number | PropertyDescriptor,
  ) => {
    getMetadataArgsStorage().metadatas.push({
      type: 'metadata',
      target,
      propertyKey,
      parameterIndex:
        typeof parameterIndexOrPropertyDescriptor === 'number'
          ? parameterIndexOrPropertyDescriptor
          : undefined,
      propertyDescriptor:
        typeof parameterIndexOrPropertyDescriptor === 'object'
          ? parameterIndexOrPropertyDescriptor
          : undefined,
      key,
      value,
      reducer,
    })
  }
}
