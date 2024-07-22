import { Action } from '../decorators/Action.js'
import { Controller } from '../decorators/Controller.js'
import { Application } from './Application.js'

export abstract class Scanner {
  public onAction?(action: Action): void | Promise<void>

  public onController?(controller: Controller): void | Promise<void>

  public onApplication?(application: Application): void | Promise<void>

  public onInitialize?(): void | Promise<void>
}
