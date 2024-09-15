import { Class, Metadata } from '@bluish/core'
import { HTTP_VERSION } from '../constants/constants.js'

export function Version(version: unknown) {
  return (target: Class | object, propertyKey?: string | symbol) => {
    Metadata(HTTP_VERSION, [version], (value, previous) =>
      previous.concat(value),
    )(target, propertyKey)
  }
}
