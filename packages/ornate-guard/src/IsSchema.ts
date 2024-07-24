import { Class } from '@bluish/core'

const schemas = new Set<Class>()

export function IsSchema(target: Class) {
  schemas.add(target)
}

export function isSchema(target: Class) {
  return schemas.has(target)
}
