import { Action, getMetadataArgsStorage } from '../core.js'
import { isSameAction } from '../tools/isSameAction.js'

export function buildControllerActionPipes(action: Action) {
  for (const pipe of getMetadataArgsStorage().pipes) {
    if (!pipe.propertyKey) continue

    if (!isSameAction(action, pipe.target, pipe.propertyKey)) continue

    action.pipes.push(pipe.pipe)
  }
}
