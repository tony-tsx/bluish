import { generateContextId } from '../tools/generateContextId.js';
import { Runner } from './Runner.js';

export abstract class Context {
  public readonly id!: string;

  public readonly runner!: Runner;

  public initialize(): void | Promise<void>;
  public async initialize() {
    // @ts-expect-error: TODO
    this.id = await generateContextId();
  }

  [key: string]: any;
  [key: symbol]: any;
}

export interface Context extends Bluish.Context {}

declare global {
  namespace Bluish {
    interface Context {}
  }
}
