import { Controller, getMetadataArgsStorage } from '../core.js'
import { isSameController } from '../tools/isSameController.js'

export function buildControllerMiddlewares(controller: Controller) {
  for (const middleware of getMetadataArgsStorage().middlewares) {
    if (!isSameController(controller, middleware.target)) continue

    if (middleware.propertyKey !== undefined) continue

    controller.middlewares.push(middleware.middleware)
  }
}
