import { HandlerExecuteEvent } from './HandlerExecuteEvent.js';

export class HandlerExecuteFinishEvent extends HandlerExecuteEvent {
  public readonly cancelable = false;

  public readonly stopable = false;
}
