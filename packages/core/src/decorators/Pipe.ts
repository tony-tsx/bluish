import { ApplicationInjection } from '../models/ApplicationInjection.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Class } from '../typings/Class.js'
import { Next } from '../typings/Next.js'

export type PipeFunction = (
  injection: ApplicationInjection,
  next: Next,
) => unknown

export function Pipe(pipe: Pipe) {
  return (
    target: Class | object,
    propertyKey?: string | symbol,
    parameterIndexOrDescriptor?:
      | undefined
      | number
      | TypedPropertyDescriptor<any>,
  ) => {
    getMetadataArgsStorage().pipes.push({
      target,
      propertyKey,
      parameterIndex:
        typeof parameterIndexOrDescriptor === 'number'
          ? parameterIndexOrDescriptor
          : undefined,
      description:
        typeof parameterIndexOrDescriptor === 'object'
          ? parameterIndexOrDescriptor
          : undefined,
      pipe,
    })
  }
}

export type Pipe = PipeFunction
