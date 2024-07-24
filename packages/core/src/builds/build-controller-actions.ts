import { Action, Controller, getMetadataArgsStorage } from '../core.js'
import { isSameController } from '../tools/isSameController.js'

export function buildControllerActions(
  controller: Controller,
  onAction: (action: Action) => void,
) {
  for (const _action of getMetadataArgsStorage().actions) {
    if (!isSameController(controller, _action.target)) continue

    const action: Action = {
      context: _action.context,
      target: _action.target,
      propertyKey: _action.propertyKey,
      middlewares: _action.middlewares ?? [],
      arguments: new Map(),
      isIsolated: false,
      controller,
      metadata: {},
      pipes: [],
      injections: {
        parameters: new Map(),
      },
    }

    onAction(action)

    controller.actions.push(action)
  }
}
