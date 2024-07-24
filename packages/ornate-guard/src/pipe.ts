import { Pipe } from '@bluish/core'
import { assert } from 'ornate-guard'
import { isSchema } from './IsSchema.js'

export const pipe: Pipe = async function pipe(value, argument, context) {
  const schema = argument.metadata['@ornate-guard:schema']

  if (!schema && !isSchema(argument.type)) return value

  const type = typeof schema === 'function' ? schema() : argument.type

  const data = typeof value === 'object' ? (value ?? {}) : {}

  const instance = await assert(data, type, {
    share: { context },
  })

  return instance
}
