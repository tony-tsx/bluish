import { ApplicationSourcePropertiesInjectCollection } from './ApplicationSourcePropertiesInjectCollection.js'
import { ApplicationSourcePropertiesSelectorCollection } from './ApplicationSourcePropertiesSelectorCollection.js'
import { Module } from './Module.js'

export class ApplicationSourceProperties {
  public readonly selectors: ApplicationSourcePropertiesSelectorCollection

  public readonly injects: ApplicationSourcePropertiesInjectCollection

  constructor() {
    this.selectors = new ApplicationSourcePropertiesSelectorCollection()

    this.injects = new ApplicationSourcePropertiesInjectCollection()
  }

  public async toProperties(module: Module) {
    const properties = await this.selectors.toProperties(module)

    return await this.injects.toProperties(module, properties)
  }
}
