import { Class, getReflectMetadata, Input } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export type ParamTransform = (value: unknown, context: HttpContext) => unknown

export function Param(target: Class | object, propertyKey: string): void
export function Param(
  transform: ParamTransform,
): (target: Class | object, propertyKey: string) => void
export function Param(
  name: string,
  transform?: ParamTransform,
): (
  target: Class | object,
  propertyKey: undefined | string | symbol,
  parameterIndex: number,
) => void
export function Param(
  targetOrNameOrTransform: string | ParamTransform | Class | object,
  maybePropertyKeyOrTransform?: string | ParamTransform,
): any {
  if (typeof targetOrNameOrTransform === 'string') {
    const name = targetOrNameOrTransform
    const transform = maybePropertyKeyOrTransform as ParamTransform | undefined

    if (transform)
      return Input(HttpContext, context => {
        if (context.request.params[name] === undefined) return null

        return transform(context.request.params[name], context)
      })

    return (
      target: Class | object,
      propertyKey: undefined | string | symbol,
      parameterIndex: number,
    ) => {
      if (propertyKey === undefined) {
        if (parameterIndex === undefined) throw new TypeError()

        const type = getReflectMetadata<any[]>('design:paramtypes', target)?.[
          parameterIndex
        ]

        if (type)
          return Input(HttpContext, context => {
            if (context.request.params[name] === undefined) return undefined

            return type(context.request.params[name])
          })(target, propertyKey, parameterIndex)

        return Input(HttpContext, context => context.request.params[name])(
          target,
          propertyKey,
          parameterIndex,
        )
      }

      if (parameterIndex === undefined) {
        if (typeof propertyKey !== 'string') throw new TypeError()

        const type = getReflectMetadata<any>('design:type', target, propertyKey)

        if (type)
          return Input(HttpContext, context => {
            if (context.request.params[name] === undefined) return undefined

            return type(context.request.params[name])
          })(target, propertyKey)

        return Input(HttpContext, context => context.request.params[name])
      }

      const type = getReflectMetadata<any[]>(
        'design:paramtypes',
        target,
        propertyKey,
      )?.[parameterIndex]

      if (type)
        return Input(HttpContext, context => {
          if (context.request.params[name] === undefined) return undefined

          return type(context.request.params[name])
        })(target, propertyKey, parameterIndex)

      return Input(HttpContext, context => context.request.params[name])(
        target,
        propertyKey,
        parameterIndex,
      )
    }
  }

  if (maybePropertyKeyOrTransform === undefined) {
    if (typeof targetOrNameOrTransform !== 'function') throw new TypeError()

    const transform = targetOrNameOrTransform as ParamTransform

    return (target: Class | object, propertyKey: string) => {
      Input(HttpContext, context =>
        transform(context.request.params[propertyKey], context),
      )(target, propertyKey)
    }
  }

  if (typeof maybePropertyKeyOrTransform !== 'string') throw new TypeError()

  const target = targetOrNameOrTransform as Class | object
  const propertyKey = maybePropertyKeyOrTransform

  const type = getReflectMetadata<any>('design:type', target, propertyKey)

  if (type)
    return Input(HttpContext, context => {
      if (context.request.params[propertyKey] === undefined) return undefined

      return type(context.request.params[propertyKey])
    })(target, propertyKey)

  return Input(HttpContext, context => context.request.params[propertyKey])(
    target,
    propertyKey,
  )
}
