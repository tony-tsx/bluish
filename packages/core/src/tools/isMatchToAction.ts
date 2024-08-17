import { isMatchToClass } from './isMatchToClass.js'
import { Class } from '../typings/Class.js'
import { ApplicationControllerAction } from '../models/ApplicationControllerAction.js'

export function isMatchToAction(
  action: ApplicationControllerAction,
  target: Class | object,
  propertyKey: string | symbol,
) {
  if (!isMatchToClass(action.controller.target, target)) return false

  if (typeof action.target !== typeof target) return false

  if (action.propertyKey !== propertyKey) return false

  return true
}
