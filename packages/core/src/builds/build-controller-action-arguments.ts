import { Action, getMetadataArgsStorage } from '../core.js'
import { Argument } from '../decorators/Argument.js'
import { getReflectMetadata } from '../tools/getReflectMetadata.js'
import { isSameAction } from '../tools/isSameAction.js'

export function buildControllerActionArguments(
  action: Action,
  onArgument: (argument: Argument) => void,
) {
  const paramtypes = getReflectMetadata<unknown[]>(
    'design:paramtypes',
    action.target,
    action.propertyKey,
  )

  for (const selector of getMetadataArgsStorage().selectors) {
    if (!isSameAction(action, selector.target, selector.propertyKey)) continue

    if (!action.arguments.has(selector.parameterIndex)) {
      const argument: Argument = {
        action,
        metadata: {},
        selectors: [],
        parameterIndex: selector.parameterIndex,
        propertyKey: selector.propertyKey,
        target: selector.target,
        type: paramtypes?.[selector.parameterIndex],
      }

      action.arguments.set(selector.parameterIndex, argument)

      onArgument(argument)
    }

    const argument = action.arguments.get(selector.parameterIndex)!

    argument.selectors.push({
      context: selector.context,
      selector: selector.selector,
    })
  }
}
