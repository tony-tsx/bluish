import { ActionEvent } from './ActionEvent.js';

export class ActionFinallyEvent extends ActionEvent {
  public readonly cancelable = false;

  public readonly stopable = false;
}
