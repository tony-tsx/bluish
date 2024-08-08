import { Action, Application, Argument, Controller } from '../core.js'

export interface SetupHandlers {
  onApplication?(application: Application): void
  onController?(controller: Controller): void
  onAction?(action: Action): void
  onArgument?(argument: Argument): void
}

export class Setup {
  constructor(private readonly handlers: SetupHandlers) {}

  public onApplication(application: Application) {
    this.handlers.onApplication?.(application)
  }

  public onController(controller: Controller) {
    this.handlers.onController?.(controller)
  }

  public onAction(action: Action) {
    this.handlers.onAction?.(action)
  }

  public onArgument(argument: Argument) {
    this.handlers.onArgument?.(argument)
  }
}
