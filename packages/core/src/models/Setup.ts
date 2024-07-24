import { Action, Argument, Controller } from '../core.js'

export interface SetupHandlers {
  onController?(controller: Controller): void
  onAction?(action: Action): void
  onArgument?(argument: Argument): void
}

export class Setup {
  constructor(private readonly handlers: SetupHandlers) {}

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
