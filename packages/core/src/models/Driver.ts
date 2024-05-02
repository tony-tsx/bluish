import { Context } from './Context.js';
import { Runner } from './Runner.js';
import { Application } from './Application.js';
import { Middleware } from './Middleware.js';

export abstract class Driver extends Middleware {
  public app!: Application;

  public onBootstrapDone?(): void | Promise<void>;

  public abstract toContext(runner: Runner, ...args: any[]): Context | Promise<Context>;

  public abstract toReturn(payload: unknown, context: Context): any | Promise<any>;
}
