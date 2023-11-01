import { HandlerExecuteEvent } from './HandlerExecuteEvent.js';

export class BeforeHandlerExecuteEvent extends HandlerExecuteEvent {
  public readonly cancelable = true;

  public readonly stopable = true;

  public payload: unknown = null;

  public prevent(payload: unknown) {
    this.payload = payload;

    this.preventDefault();
    this.stopPropagation();
  }
}
