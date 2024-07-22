import { Controller } from '../decorators/Controller.js'
import { Class } from '../typings/Class.js'

export function isSameController(
  controller: Controller,
  target: Class | object,
) {
  if (typeof target === 'function') {
    if (target === controller.target) return true

    if (target.prototype instanceof controller.target) return true

    return false
  }

  if (target.constructor === controller.target) return true

  if (target instanceof controller.target) return true

  return false
}
