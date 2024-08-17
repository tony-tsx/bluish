import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { getReflectMetadata } from '../tools/getReflectMetadata.js'
import { Class } from '../typings/Class.js'

export function Inject(
  target: Class | object,
  propertyKey: undefined | string | symbol,
  parameterIndex?: undefined | number,
): void
export function Inject(
  reference: unknown,
): (
  target: Class | object,
  propertyKey: undefined | string | symbol,
  parameterIndex?: undefined | number,
) => void
export function Inject(
  targetOrInjectableReference: unknown,
  maybePropertyKey?: undefined | string | symbol,
  maybeParameterIndex?: number,
) {
  if (maybePropertyKey !== undefined || maybeParameterIndex !== undefined) {
    const target = targetOrInjectableReference as Class | object
    const propertyKey = maybePropertyKey
    const parameterIndex = maybeParameterIndex
    let ref: () => unknown

    if (parameterIndex !== undefined)
      if (propertyKey !== undefined)
        ref = () =>
          getReflectMetadata<unknown[]>(
            'design:paramtypes',
            target,
            propertyKey,
          )?.[parameterIndex]
      else
        ref = () =>
          getReflectMetadata<unknown[]>('design:paramtypes', target)?.[
            parameterIndex
          ]
    else if (propertyKey !== undefined)
      ref = () =>
        getReflectMetadata<unknown[]>('design:type', target, propertyKey)
    else throw new Error(`Invalid inject decorator usage`)

    getMetadataArgsStorage().injects.push({
      target,
      propertyKey,
      parameterIndex,
      ref,
    })

    return
  }

  return (
    target: Class | object,
    propertyKey: undefined | string | symbol,
    parameterIndex: undefined | number,
  ) => {
    getMetadataArgsStorage().injects.push({
      target,
      propertyKey,
      parameterIndex,
      ref: targetOrInjectableReference,
    })
  }
}
