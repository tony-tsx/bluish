import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Class } from '../typings/Class.js'

export function Metadata<T>(
  key: string,
  value: T | (() => T),
  reducer?: (value: T, previous: T) => T,
) {
  return (
    target: Class | object,
    propertyKey?: string | symbol,
    parameterIndex?: number | PropertyDescriptor,
  ) => {
    getMetadataArgsStorage().metadatas.unshift({
      target,
      propertyKey,
      parameterIndex:
        typeof parameterIndex === 'number' ? parameterIndex : undefined,
      key,
      value,
      reducer,
    })
  }
}
