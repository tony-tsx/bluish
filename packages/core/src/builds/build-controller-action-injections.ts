import { Action, getMetadataArgsStorage } from '../core.js'
import { isSameAction } from '../tools/isSameAction.js'

export function buildControllerActionInjections(action: Action) {
  for (const inject of getMetadataArgsStorage().injects) {
    if (!inject.propertyKey) continue

    if (inject.parameterIndex === undefined) continue

    if (!isSameAction(action, inject.target, inject.propertyKey)) continue

    action.injections.parameters.set(inject.parameterIndex, inject.injectable)
  }
}
