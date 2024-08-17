import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Class, Constructable } from '../typings/Class.js'

export interface ControllerOptions {
  inherit?: () => Class
}

export function Controller(target: Constructable): void
export function Controller(
  options: ControllerOptions,
): (target: Constructable) => void
export function Controller(targetOrOptions: ControllerOptions | Constructable) {
  if (typeof targetOrOptions === 'object')
    return (target: Constructable) => {
      getMetadataArgsStorage().controllers.push({
        target,
        inherit: targetOrOptions.inherit,
      })
    }

  getMetadataArgsStorage().controllers.push({
    target: targetOrOptions,
  })
}

/*
Controller.each = function each<T>(
  _controller: Controller,
  fn: (controller: Controller) => T,
): T[] {
  let controller: Controller | null = _controller
  const map: T[] = []

  do {
    map.push(fn(controller))

    controller = controller.inherit
  } while (controller)

  return map
}
*/
