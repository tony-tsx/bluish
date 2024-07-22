import { Action } from '../decorators/Action.js'
import { isSameController } from './isSameController.js'
import { Class } from '../typings/Class.js'

export function isSameAction(
  action: Action,
  target: Class | object,
  propertyKey: string | symbol,
) {
  if (!isSameController(action.controller, target)) return false

  if (typeof action.target !== typeof target) return false

  if (action.propertyKey !== propertyKey) return false

  return true
}
