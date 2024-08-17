import { Class } from '../typings/Class.js'

export function isMatchToClass(target: Class, test: Class | object) {
  if (typeof test === 'function') {
    if (test === target) return true

    if (target.prototype instanceof test) return true

    return false
  }

  if (target.prototype === test) return true

  if (target.prototype instanceof test.constructor) return true

  return false
}
