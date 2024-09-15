import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Constructable } from '../typings/Class.js'

export interface ControllerInheritsOptions {
  /**
   * @default true
   */
  pipes?: boolean
  /**
   * @default false
   */
  actions?: boolean
  /**
   * @default true
   */
  middlewares?: boolean
  /**
   * @default true
   */
  usables?: boolean
  /**
   * @default true
   */
  selectors?: boolean
  /**
   * @default true
   */
  injects?: boolean
  /**
   * @default true
   */
  metadata?: boolean
}

export interface ControllerOptions {
  inherits?: ControllerInheritsOptions
}

export function Controller(target: Constructable): void
export function Controller(
  options: ControllerOptions,
): (target: Constructable) => void
export function Controller(targetOrOptions: ControllerOptions | Constructable) {
  if (typeof targetOrOptions === 'object')
    return (target: Constructable) => {
      getMetadataArgsStorage().controllers.push({
        type: 'controller',
        target,
        inherit: targetOrOptions.inherits,
      })
    }

  getMetadataArgsStorage().controllers.push({
    type: 'controller',
    target: targetOrOptions,
  })
}
