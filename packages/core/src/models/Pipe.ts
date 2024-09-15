import { IUsable } from '../decorators/Use.js'
import { PipeFunction } from '../decorators/UsePipe.js'
import { Application } from './Application.js'
import { ApplicationSource } from './ApplicationSource.js'
import { ApplicationSourceAction } from './ApplicationSourceAction.js'
import { ApplicationSourceArgument } from './ApplicationSourceArgument.js'
import { ApplicationSourceProperty } from './ApplicationSourceProperty.js'

export class Pipe implements IUsable {
  constructor(public readonly run: PipeFunction) {}

  public use(
    target:
      | Application
      | ApplicationSource
      | ApplicationSourceAction
      | ApplicationSourceArgument
      | ApplicationSourceProperty,
  ) {
    if (target instanceof Application) return void target.pipes.add(this)

    if (target instanceof ApplicationSource) return void target.pipes.add(this)

    if (target instanceof ApplicationSourceAction)
      return void target.pipes.add(this)

    if (target instanceof ApplicationSourceArgument)
      return void target.pipes.add(this)

    if (target instanceof ApplicationSourceProperty)
      return void target.pipes.add(this)

    throw new TypeError()
  }
}
