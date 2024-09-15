import { Constructable, Controller, ControllerOptions } from '@bluish/core'
import { Path } from './Path.js'
import { Version } from './Version.js'

export interface HttpControllerOptions extends ControllerOptions {
  version?: number
}

export function HttpController(target: Constructable): void
export function HttpController(
  path: string | string[],
  options?: HttpControllerOptions,
): (target: Constructable) => void
export function HttpController(
  targetOrPath: string | string[] | Constructable,
  { version, ...options }: HttpControllerOptions = {},
) {
  if (typeof targetOrPath === 'string' || Array.isArray(targetOrPath))
    return (target: Constructable) => {
      Controller(options)(target)
      Path(targetOrPath)(target)

      if (version !== undefined) Version(version)(target)
    }

  return Controller(targetOrPath)
}
