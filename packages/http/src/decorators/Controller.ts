import { Class, Controller as CoreController } from '@bluish/core'
import { Path } from './Path.js'
import { ControllerOptions } from '../../../core/dist/esm/decorators/Controller.js'

export function Controller(target: Class): void
export function Controller(
  path: string | string[],
  options?: ControllerOptions,
): (target: Class) => void
export function Controller(
  targetOrPath: string | string[] | Class,
  options: ControllerOptions = {},
) {
  if (typeof targetOrPath === 'string' || Array.isArray(targetOrPath))
    return (target: Class) => {
      CoreController(options)(target)
      Path(targetOrPath)(target)
    }

  return CoreController(targetOrPath)
}
