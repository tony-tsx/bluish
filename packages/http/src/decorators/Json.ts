import { Class } from '@bluish/core'
import { ContentType } from './ContentType.js'

export function Json(target: Class): void
export function Json(target: Class | object, propertyKey: string | symbol): void
export function Json(target: Class | object, propertyKey?: string | symbol) {
  ContentType('application/json', value => JSON.stringify(value))(
    target,
    propertyKey,
  )
}
