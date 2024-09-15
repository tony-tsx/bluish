import { Class } from '../typings/Class.js'

export function isMatchToClass(
  target: Class,
  test: Class | object,
  strict: boolean,
) {
  if (typeof test === 'function') {
    if (test === target) return true

    if (!strict && target.prototype instanceof test) return true

    return false
  }

  if (target.prototype === test) return true

  if (!strict && target.prototype instanceof test.constructor) return true

  return false
}
