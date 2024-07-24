import { Action, getMetadataArgsStorage } from '../core.js'
import { isSameAction } from '../tools/isSameAction.js'

export function buildControllerActionMiddlewares(action: Action) {
  for (const middleware of getMetadataArgsStorage().middlewares) {
    if (!middleware.propertyKey) continue

    if (!isSameAction(action, middleware.target, middleware.propertyKey))
      continue

    action.middlewares.push(middleware.middleware)
  }
}
