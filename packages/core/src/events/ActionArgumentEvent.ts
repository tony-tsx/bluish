import { ActionEvent } from './ActionEvent.js';
import { Context } from '../models/Context.js';

export class ActionArgumentEvent extends ActionEvent {
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
