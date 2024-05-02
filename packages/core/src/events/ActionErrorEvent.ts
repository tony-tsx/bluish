import { Context } from '../models/Context.js';
import { ActionEvent } from './ActionEvent.js';

export class ActionErrorEvent extends ActionEvent {
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
