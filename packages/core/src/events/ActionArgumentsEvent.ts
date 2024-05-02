import { ActionEvent } from './ActionEvent.js';
import { Context } from '../models/Context.js';

export class ActionArgumentsEvent extends ActionEvent {
  public readonly cancelable = false;

  public readonly stopable = false;

  constructor(
    public args: unknown[],
    context: Context,
  ) {
    super(context);
  }
}
