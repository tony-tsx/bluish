import { PipeFunction } from '../decorators/UsePipe.js'
import { Context } from '../models/Context.js'

export const injectable: PipeFunction = async function injectable(input, next) {
  if (
    typeof input.inject === 'function' &&
    (input.inject === Context || input.inject.prototype instanceof Context) &&
    input.module.context instanceof input.inject
  )
    return next(input.module.context)

  if (!input.module.has(input.inject)) return next()

  const injectable = await input.module.resolve(input.inject)

  return next(injectable)
}
