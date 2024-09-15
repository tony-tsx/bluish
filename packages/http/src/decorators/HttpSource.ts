import { Constructable, Controller, ControllerOptions } from '@bluish/core'
import { Path } from './Path.js'
import { Version } from './Version.js'

export interface HttpSourceOptions extends ControllerOptions {
  version?: number
}

export function HttpSource(target: Constructable): void
export function HttpSource(
  path: string | string[],
  options?: HttpSourceOptions,
): (target: Constructable) => void
export function HttpSource(
  targetOrPath: string | string[] | Constructable,
  { version, ...options }: HttpSourceOptions = {},
) {
  if (typeof targetOrPath === 'string' || Array.isArray(targetOrPath))
    return (target: Constructable) => {
      Controller(options)(target)
      Path(targetOrPath)(target)

      if (version !== undefined) Version(version)(target)
    }

  return Controller(targetOrPath)
}
