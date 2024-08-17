import { Constructable } from '../typings/Class.js'
import { Application } from './Application.js'
import { ApplicationController } from './ApplicationController.js'
import { MetadataControllerArg } from './MetadataArgsStorage.js'

export class ApplicationControllerCollection extends Set<ApplicationController> {
  constructor(public readonly application: Application) {
    super()
  }

  public findByConstructable(constructable: Constructable) {
    for (const controller of this)
      if (controller.target === constructable) return controller
  }

  public override add(
    _controller: MetadataControllerArg | ApplicationController,
  ) {
    if (_controller instanceof ApplicationController)
      return super.add(_controller)

    return super.add(new ApplicationController(this.application, _controller))
  }
}
