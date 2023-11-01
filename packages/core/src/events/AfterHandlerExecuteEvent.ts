import { Context } from '../models/Context.js';
import { HandlerExecuteEvent } from './HandlerExecuteEvent.js';

export class AfterHandlerExecuteEvent extends HandlerExecuteEvent {
  public readonly cancelable = false;

  public readonly stopable = true;

  constructor(
    public payload: unknown,
    context: Context,
  ) {
    super(context);
  }

  public prevent(payload: unknown) {
    Object.assign(this, { payload });

    this.preventDefault();

    this.stopPropagation();
  }
}
