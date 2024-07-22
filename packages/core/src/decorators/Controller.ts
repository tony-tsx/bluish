import { Application } from '../models/Application.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Middleware } from '../models/Middleware.js'
import { Class } from '../typings/Class.js'
import { InjectableReference } from '../typings/InjectableReference.js'
import { Action } from './Action.js'

export interface ControllerOptions {
  inherit?: () => Class
}

export function Controller(target: Class): void
export function Controller(options: ControllerOptions): (target: Class) => void
export function Controller(targetOrOptions: ControllerOptions | Class) {
  if (typeof targetOrOptions === 'object')
    return (target: Class) => {
      getMetadataArgsStorage().controllers.push({
        target,
        isIsolated: false,
        middlewares: [],
        inherit: targetOrOptions.inherit,
      })
    }

  getMetadataArgsStorage().controllers.push({
    target: targetOrOptions,
    isIsolated: false,
    middlewares: [],
  })
}

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

export interface Controller {
  target: Class
  actions: Action[]
  heirs: Controller[]
  middlewares: Middleware[]
  isIsolated: boolean
  application: Application
  metadata: Partial<Bluish.Controller.Metadata>
  injections: {
    static: Map<string | symbol, InjectableReference>
    parameters: Map<number, InjectableReference>
    properties: Map<string | symbol, InjectableReference>
  }
  inherit: Controller | null
}
