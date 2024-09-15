import { isMatchToClass } from './isMatchToClass.js'
import { Class } from '../typings/Class.js'
import { ApplicationSourceAction } from '../models/ApplicationSourceAction.js'

export function isMatchToAction(
  action: ApplicationSourceAction,
  target: Class | object,
  propertyKey: string | symbol,
) {
  if (!isMatchToClass(action.controller.target, target, false)) return false

  if (typeof action.target !== typeof target) return false

  if (action.propertyKey !== propertyKey) return false

  return true
}
