import { Runner } from './Runner.js';

export abstract class Context {
  public readonly runner!: Runner;

  [key: string]: any;
  [key: symbol]: any;
}

export interface Context extends Bluish.Context {}

declare global {
  namespace Bluish {
    interface Context {}
  }
}
