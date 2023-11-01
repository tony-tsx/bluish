import { HandlerExecuteEvent } from './HandlerExecuteEvent.js';
import { Context } from '../models/Context.js';

export class HandlerExecuteParameterEvent extends HandlerExecuteEvent {
  public readonly cancelable = false;

  public readonly stopable = false;

  constructor(
    public value: unknown,
    public readonly parameterIndex: number,
    context: Context,
  ) {
    super(context);
  }
}
