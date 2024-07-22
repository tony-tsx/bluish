import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { InjectableReference } from '../typings/InjectableReference.js'

export function Inject(service: InjectableReference) {
  return (
    target: Function | Object,
    propertyKey: symbol | string | undefined,
    parameterIndex?: number,
  ) => {
    getMetadataArgsStorage().injects.push({
      target,
      propertyKey,
      parameterIndex,
      injectable: service,
    })
  }
}
