import { ApplicationSourceArgumentsInjectCollection } from './ApplicationSourceArgumentsInjectCollection.js'
import { ApplicationSourceArgumentsSelectorCollection } from './ApplicationSourceArgumentsSelectorCollection.js'
import { Module } from './Module.js'

export class ApplicationSourceArguments {
  public readonly selectors: ApplicationSourceArgumentsSelectorCollection

  public readonly injects: ApplicationSourceArgumentsInjectCollection

  constructor() {
    this.selectors = new ApplicationSourceArgumentsSelectorCollection()

    this.injects = new ApplicationSourceArgumentsInjectCollection()
  }

  public async toArguments(module: Module) {
    const args = await this.selectors.toArguments(module)

    return await this.injects.toArguments(module, args)
  }
}
