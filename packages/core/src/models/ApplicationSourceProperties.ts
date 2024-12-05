import { Next } from '../decorators/Next.js'
import { chain } from '../tools/chain.js'
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

function run(
  this: any,
  [propertyKey, property]: [string | symbol, ApplicationSourceProperty],
  module: Module,
  next: Next,
) {
  return property.mount(this, module, value => {
    this[propertyKey] = value

    return next()
  })
}

export class ApplicationSourceProperties {
  #properties = new Map<string | symbol, ApplicationSourceProperty>()

  #fn!: (this: any, next: Next | null, module: Module) => Promise<unknown>

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

  public define(
    target: any,
    module: Module,
    next: () => unknown,
  ): Promise<unknown> {
    if (!this.#fn) this.#fn = chain(Array.from(this.#properties), run)

    return this.#fn.call(target, async () => next(), module)
  }
}
