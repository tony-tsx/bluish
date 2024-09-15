import { Application } from '../models/Application.js'
import { ApplicationSource } from '../models/ApplicationSource.js'
import { ApplicationSourceAction } from '../models/ApplicationSourceAction.js'
import { ApplicationSourceArgument } from '../models/ApplicationSourceArgument.js'
import { ApplicationSourceProperty } from '../models/ApplicationSourceProperty.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Class } from '../typings/Class.js'

export interface IUsable {
  use(
    target:
      | Application
      | ApplicationSource
      | ApplicationSourceAction
      | ApplicationSourceArgument
      | ApplicationSourceProperty,
  ): void
}

export function Use(usable: IUsable) {
  return (
    target: Class | object,
    propertyKey?: undefined | string | symbol,
    parameterIndexOrPropertyDecorator?:
      | undefined
      | number
      | TypedPropertyDescriptor<any>,
  ) => {
    getMetadataArgsStorage().usables.unshift({
      type: 'usable',
      target,
      propertyKey: propertyKey,
      parameterIndex:
        typeof parameterIndexOrPropertyDecorator === 'number'
          ? parameterIndexOrPropertyDecorator
          : undefined,
      propertyDescriptor:
        typeof parameterIndexOrPropertyDecorator === 'object'
          ? parameterIndexOrPropertyDecorator
          : undefined,
      usable,
    })
  }
}
