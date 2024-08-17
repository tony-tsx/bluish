import { Pipe } from '../decorators/Pipe.js'

export const injectable: Pipe = async function injectable(injection, next) {
  if (!injection.module.has(injection.inject.ref)) return next()

  injection.value = await injection.module.resolve(injection.inject.ref)

  return next()
}
