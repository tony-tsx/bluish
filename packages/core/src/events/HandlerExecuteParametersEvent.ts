import { HandlerExecuteEvent } from './HandlerExecuteEvent.js';
import { Context } from '../models/Context.js';

export class HandlerExecuteParametersEvent extends HandlerExecuteEvent {
  public readonly cancelable = false;

  public readonly stopable = false;

  constructor(
    public parameters: unknown[],
    context: Context,
  ) {
    super(context);
  }
}
