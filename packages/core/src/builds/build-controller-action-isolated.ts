import { Action, getMetadataArgsStorage } from '../core.js'
import { isSameAction } from '../tools/isSameAction.js'

export function buildControllerActionIsolated(action: Action) {
  for (const isolated of getMetadataArgsStorage().isolated) {
    if (!isolated.propertyKey) continue

    if (!isSameAction(action, isolated.target, isolated.propertyKey)) continue

    action.isIsolated = true

    break
  }
}
