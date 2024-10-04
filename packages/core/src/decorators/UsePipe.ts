import { ApplicationSourceArgument } from '../models/ApplicationSourceArgument.js'
import { ApplicationSourceProperty } from '../models/ApplicationSourceProperty.js'
import { ApplicationSourceMetadata } from '../models/ApplicationSourceMetadata.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Module } from '../models/Module.js'
import { Class } from '../typings/Class.js'
import { Next } from './Next.js'

export type PipeInput = {
  readonly this: unknown
  readonly target: ApplicationSourceArgument | ApplicationSourceProperty
  readonly module: Module
  readonly metadata: ApplicationSourceMetadata
  inject: unknown
  value: any
}

export type PipeFunction = (input: PipeInput, next: Next) => unknown

export function UsePipe(pipe: PipeFunction) {
  return (
    target: Class | object,
    propertyKey?: string | symbol,
    parameterIndexOrDescriptor?:
      | undefined
      | number
      | TypedPropertyDescriptor<any>,
  ) => {
    getMetadataArgsStorage().pipes.push({
      type: 'pipe',
      target,
      propertyKey,
      parameterIndex:
        typeof parameterIndexOrDescriptor === 'number'
          ? parameterIndexOrDescriptor
          : undefined,
      propertyDescriptor:
        typeof parameterIndexOrDescriptor === 'object'
          ? parameterIndexOrDescriptor
          : undefined,
      pipe,
    })
  }
}
