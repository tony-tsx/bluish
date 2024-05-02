import { Context } from '../models/Context.js';
import { ActionEvent } from './ActionEvent.js';

export class ActionThenEvent extends ActionEvent {
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
