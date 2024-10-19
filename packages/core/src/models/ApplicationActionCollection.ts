import { Class } from '../typings/Class.js'
import { Context } from '../models/Context.js'
import { Application } from './Application.js'
import { ApplicationSourceAction } from './ApplicationSourceAction.js'

export class ApplicationActionCollection {
  #application: Application

  constructor(application: Application) {
    this.#application = application
  }

  public filterByContext(context: Class<Context>): ApplicationSourceAction[] {
    return Array.from(this.#application.controllers).flatMap(controller =>
      controller.actions.filterByContext(context),
    )
  }

  public map(
    contexts: Class<Context>[],
  ): Map<Class<Context>, ApplicationSourceAction[]> {
    const map = new Map<Class<Context>, ApplicationSourceAction[]>()

    for (const context of contexts)
      map.set(context, this.filterByContext(context))

    return map
  }
}
