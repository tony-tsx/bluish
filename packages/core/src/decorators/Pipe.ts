import { Class, Context, getMetadataArgsStorage } from '../core.js'
import { Argument } from './Argument.js'

export function Pipe(pipe: (value: unknown, argument: Argument) => unknown) {
  return (target: Class | object, propertyKey?: string | symbol) => {
    getMetadataArgsStorage().pipes.push({
      target,
      propertyKey,
      pipe,
    })
  }
}

export type Pipe = (
  value: unknown,
  argument: Argument,
  context: Context,
) => unknown
