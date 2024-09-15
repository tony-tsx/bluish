import { Constructable } from '../typings/Class.js'
import { Application } from './Application.js'
import { ApplicationSource } from './ApplicationSource.js'
import { MetadataControllerArg } from './MetadataArgsStorage.js'

export class ApplicationControllerCollection extends Set<ApplicationSource> {
  constructor(public readonly application: Application) {
    super()
  }

  public findByConstructable(constructable: Constructable) {
    for (const controller of this)
      if (controller.target === constructable) return controller
  }

  public override add(_controller: MetadataControllerArg | ApplicationSource) {
    if (_controller instanceof ApplicationSource) return super.add(_controller)

    return super.add(new ApplicationSource(this.application, _controller))
  }
}
