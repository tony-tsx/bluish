import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Class } from '../typings/Class.js'

export function Metadata<T>(
  key: string,
  value: T,
  reducer: (value: T, previous: T) => T = (_, value) => value,
) {
  return (
    target: Class | object,
    propertyKey?: string | symbol,
    parameterIndex?: number | PropertyDescriptor,
  ) => {
    getMetadataArgsStorage().metadatas.push({
      target,
      key,
      value,
      propertyKey,
      parameterIndex:
        typeof parameterIndex === 'number' ? parameterIndex : undefined,
      reducer: reducer as () => unknown,
    })
  }
}

declare global {
  namespace Bluish {
    namespace Controller {
      interface Metadata {
        [key: string]: unknown
      }
    }

    namespace Action {
      interface Types {}
      interface Metadata {
        [key: string]: unknown
      }
    }

    namespace Argument {
      interface Metadata {
        [key: string]: unknown
      }
    }
  }
}
