import { Class, Metadata } from '@bluish/core'
import { Argument } from '../../core/dist/esm/decorators/Argument.js'

export function Validate(
  schema: () => Class,
): (
  target: Class | object,
  propertyKey: string | symbol,
  parameterIndex: number,
) => void
export function Validate(
  target: Class | object,
  propertyKey: string | symbol,
  parameterIndex: number,
): void
export function Validate(
  targetOrGetSchema: Class | object,
  propertyKey?: string | symbol,
  parameterIndex?: number,
) {
  if (typeof targetOrGetSchema === 'object') {
    if (!propertyKey) throw new TypeError('propertyKey is required')

    if (parameterIndex === undefined)
      throw new TypeError('parameterIndex is required')

    return Argument(() => undefined)(
      targetOrGetSchema,
      propertyKey,
      parameterIndex,
    )
  }

  if (!propertyKey && parameterIndex === undefined) {
    return (
      target: Class | object,
      propertyKey: string | symbol,
      parameterIndex: number,
    ) => {
      Argument(() => undefined)(target, propertyKey, parameterIndex)
      Metadata('@ornate-guard:schema', targetOrGetSchema)(
        target,
        propertyKey,
        parameterIndex,
      )
    }
  }

  if (!propertyKey) throw new TypeError('propertyKey is required')

  if (parameterIndex === undefined)
    throw new TypeError('parameterIndex is required')

  Argument(() => undefined)(targetOrGetSchema, propertyKey, parameterIndex)
}
