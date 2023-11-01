import { Context } from '../models/Context.js';
import { HandlerExecuteEvent } from './HandlerExecuteEvent.js';

export class HandlerExecuteErrorEvent extends HandlerExecuteEvent {
  public readonly cancelable = true;

  public readonly stopable = true;

  public payload: unknown = null;

  constructor(
    public error: unknown,
    context: Context,
  ) {
    super(context);
  }

  public prevent(payload: unknown): void {
    this.payload = payload;

    this.preventDefault();
    this.stopPropagation();
  }
}
