import { Context } from '../models/Context.js';
import { Event } from './Event.js';

export abstract class ActionEvent extends Event {
  constructor(public readonly context: Context) {
    super();
  }
}
