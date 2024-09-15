import { Class, Input, UseMiddleware } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

/**
 * TODO: >> "⁣" <<
 */

/**
 * Usage:
 *
 * ```ts
 * ⁣@Http
 * class Controller {
 *   ⁣@POST
 *   public static action(⁣@Header headers: Record<string, string | string[]>) {}
 * }
 * ```
 *
 * ```ts
 * ⁣@Http
 * class Controller {
 *   ⁣@Header
 *   public readonly headers!: Record<string, string | string[]>
 * }
 * ```
 *
 * ```ts
 * ⁣@Http
 * class Controller {
 *   constructor(⁣@Header headers: Record<string, string | string[]>) {}
 * }
 * ```
 */
export function Header(
  target: Class | object,
  propertyKey: undefined | string | symbol,
  parameterIndex?: number,
): void
/**
 * Usage:
 *
 * ```ts
 * ⁣@Http
 * class Controller {
 *   ⁣@POST
 *   public static action(⁣@Header('X-Header-Name') xHeaderName: string) {}
 * }
 * ```
 *
 * ```ts
 * ⁣@Http
 * class Controller {
 *   ⁣@Header('X-Header-Name')
 *   public readonly xHeaderName!: string
 * }
 * ```
 *
 * ```ts
 * ⁣@Http
 * class Controller {
 *   constructor(⁣@Header('X-Header-Name') xHeaderName: string) {}
 * }
 * ```
 */
export function Header(
  name: string,
): (
  target: Class | object,
  propertyKey: undefined | string | symbol,
  parameterIndex?: number,
) => void
/**
 * Usage:
 *
 * ```ts
 * ⁣@Http
 * class Controller {
 *   ⁣@POST
 *   ⁣@Header('X-Header-Name', 'X-Header-Value')
 *   public static action() {}
 * }
 * ```
 */
export function Header(
  name: string,
  value: string | string[],
): (
  target: Class | object,
  propertyKey: string | symbol,
  decorator: TypedPropertyDescriptor<any>,
) => void
export function Header(
  targetOrName: string | Class | object,
  maybePropertyKeyOrValue?: undefined | string | symbol | string[],
  maybeParameterIndex?: number,
): any {
  if (typeof targetOrName === 'string') {
    if (
      maybePropertyKeyOrValue === undefined &&
      maybeParameterIndex === undefined
    )
      return Input(
        HttpContext,
        context => context.request.headers[targetOrName.toLowerCase()],
      )

    if (
      typeof maybePropertyKeyOrValue !== 'string' &&
      !Array.isArray(maybePropertyKeyOrValue)
    )
      throw new TypeError()

    const name = targetOrName
    const value = maybePropertyKeyOrValue

    return UseMiddleware(HttpContext, context => {
      context.response.headers[name] = value
    })
  }

  return Input(HttpContext, context => context.request.headers)
}
