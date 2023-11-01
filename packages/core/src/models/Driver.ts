import { Context } from './Context.js';
import { HandlerMetadata } from './HandlerMetadata.js';
import { Runner } from './Runner.js';
import { App } from './App.js';

export abstract class Driver {
  public app!: App;

  public initialize?(): void | Promise<void>;

  public onInitializeDone?(): void | Promise<void>;

  public onHandler?(handlerMetadata: HandlerMetadata): void | Promise<void>;

  public abstract toContext(runner: Runner, ...args: any[]): Context | Promise<Context>;

  public abstract toReturn(payload: unknown, context: Context): any | Promise<any>;

  public handleError?(error: unknown, context: Context): any | Promise<any>;
}
