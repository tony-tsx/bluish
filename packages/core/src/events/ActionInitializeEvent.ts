import { ActionEvent } from './ActionEvent.js';

export class ActionInitializeEvent extends ActionEvent {
  public readonly cancelable = true;

  public readonly stopable = true;

  public payload: unknown = null;

  public prevent(payload: unknown) {
    this.payload = payload;

    this.preventDefault();
    this.stopPropagation();
  }
}
