import { Class } from '../typings/Class.js'
import { ApplicationSourcePipeCollection } from './ApplicationSourcePipeCollection.js'
import { ApplicationSourceProperty } from './ApplicationSourceProperty.js'
import {
  MetadataArg,
  MetadataInjectArg,
  MetadataInputArg,
  MetadataPipeArg,
  MetadataUsableArg,
} from './MetadataArgsStorage.js'
import { Module } from './Module.js'

export class ApplicationSourceProperties {
  #properties = new Map<string | symbol, ApplicationSourceProperty>()

  public get length() {
    return this.#properties.size
  }

  constructor(
    public readonly target: Class | object,
    public readonly parent: ApplicationSourcePipeCollection | null,
  ) {}

  public get(propertyKey: string | symbol) {
    return this.#properties.get(propertyKey)
  }

  #get(propertyKey: string | symbol) {
    if (!this.#properties.has(propertyKey))
      this.#properties.set(
        propertyKey,
        new ApplicationSourceProperty(this.target, propertyKey, this.parent),
      )

    return this.#properties.get(propertyKey)!
  }

  public add(
    _arg:
      | MetadataInputArg
      | MetadataPipeArg
      | MetadataInjectArg
      | MetadataArg
      | MetadataUsableArg,
  ) {
    if (_arg.propertyKey === undefined)
      throw new TypeError(`Metadata arg must have a property key`)

    this.#get(_arg.propertyKey).add(_arg)
  }

  public async call(target: any, module: Module) {
    await Promise.all(
      Array.from(this.#properties).map(async ([propertyKey, property]) => {
        target[propertyKey] = (async () => {
          if (property.dependencies.size)
            await Promise.all(
              Array.from(property.dependencies).map(
                dependency => target[dependency],
              ),
            )

          return await property.call(target, module)
        })()

        target[propertyKey] = await target[propertyKey]
      }),
    )
  }
}
