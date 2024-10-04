import { Class, Input } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export type ParamTransform = (value: unknown, context: HttpContext) => unknown

export function Param(target: Class | object, propertyKey: string): void
export function Param(
  transform: ParamTransform,
  dependencies?: (string | symbol)[],
): (target: Class | object, propertyKey: string) => void
export function Param(
  name: string,
  transform?: ParamTransform,
  dependencies?: (string | symbol)[],
): (
  target: Class | object,
  propertyKey: undefined | string | symbol,
  parameterIndex: number,
) => void
export function Param(
  targetOrNameOrTransform: string | ParamTransform | Class | object,
  maybeDependenciesOrPropertyKeyOrTransform?:
    | string
    | ParamTransform
    | (string | symbol)[],
  maybeDependencies?: (string | symbol)[],
): any {
  if (typeof targetOrNameOrTransform === 'string') {
    const name = targetOrNameOrTransform
    const dependencies = maybeDependencies ?? []

    if (maybeDependenciesOrPropertyKeyOrTransform)
      if (typeof maybeDependenciesOrPropertyKeyOrTransform !== 'function')
        throw new TypeError()
      else
        return Input(
          HttpContext,
          function (context) {
            if (context.request.params[name] === undefined) return undefined

            return maybeDependenciesOrPropertyKeyOrTransform.call(
              this,
              context.request.params[name],
              context,
            )
          },
          dependencies,
        )

    return (
      target: Class | object,
      propertyKey: undefined | string | symbol,
      parameterIndex: number,
    ) => {
      if (propertyKey === undefined) {
        if (parameterIndex === undefined) throw new TypeError()

        return Input(HttpContext, context => context.request.params[name])(
          target,
          propertyKey,
          parameterIndex,
        )
      }

      if (parameterIndex === undefined) {
        if (typeof propertyKey !== 'string') throw new TypeError()

        return Input(HttpContext, context => context.request.params[name])
      }

      return Input(HttpContext, context => context.request.params[name])(
        target,
        propertyKey,
        parameterIndex,
      )
    }
  }

  if (
    maybeDependenciesOrPropertyKeyOrTransform === undefined ||
    Array.isArray(maybeDependenciesOrPropertyKeyOrTransform)
  ) {
    const dependencies = Array.isArray(
      maybeDependenciesOrPropertyKeyOrTransform,
    )
      ? maybeDependenciesOrPropertyKeyOrTransform
      : []

    if (typeof targetOrNameOrTransform !== 'function') throw new TypeError()

    const transform = targetOrNameOrTransform as ParamTransform

    return (target: Class | object, propertyKey: string) => {
      Input(
        HttpContext,
        function (context) {
          return transform.call(
            this,
            context.request.params[propertyKey],
            context,
          )
        },
        dependencies,
      )(target, propertyKey)
    }
  }

  if (typeof maybeDependenciesOrPropertyKeyOrTransform !== 'string')
    throw new TypeError()

  const target = targetOrNameOrTransform as Class | object
  const propertyKey = maybeDependenciesOrPropertyKeyOrTransform

  return Input(HttpContext, context => context.request.params[propertyKey])(
    target,
    propertyKey,
  )
}
