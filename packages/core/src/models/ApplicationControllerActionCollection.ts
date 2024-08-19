import { ApplicationController } from './ApplicationController.js'
import { ApplicationControllerAction } from './ApplicationControllerAction.js'
import { MetadataActionArg } from './MetadataArgsStorage.js'

export class ApplicationControllerActionCollection extends Set<ApplicationControllerAction> {
  constructor(public readonly controller: ApplicationController) {
    super()
  }

  public findByStaticPropertyKey(propertyKey: string | symbol) {
    for (const action of this) {
      if (!action.isStatic) continue

      if (action._action.propertyKey === propertyKey) return action
    }
  }
  public findByPropertyKey(propertyKey: string | symbol) {
    for (const action of this) {
      if (action.isStatic) continue

      if (action._action.propertyKey === propertyKey) return action
    }
  }

  public add(_action: MetadataActionArg | ApplicationControllerAction) {
    if (_action instanceof ApplicationControllerAction)
      return super.add(_action)

    return super.add(new ApplicationControllerAction(this.controller, _action))
  }
}
