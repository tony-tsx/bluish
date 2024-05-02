import { ControllerMetadataArgs } from '../metadata-args/ControllerMetadataArgs.js';
import { getMetadataArgsStorage } from '../tools/getMetadataArgsStorage.js';
import { isMetadataArgumentFor } from '../tools/is.js';
import { ActionMetadata } from './ActionMetadata.js';
import { Application } from './Application.js';
import { Context } from './Context.js';
import { Middleware } from './Middleware.js';

export class ControllerMetadata {
  private _instance: any;

  public readonly isIsolated: boolean;

  public readonly isSingleton: boolean = true;

  public readonly target: Function;

  public readonly middlewares: Middleware[];

  public readonly actions: ActionMetadata[] = [];

  public readonly wrappers: ((fn: () => unknown, context: Context) => unknown)[];

  constructor(
    public readonly app: Application,
    public readonly args: ControllerMetadataArgs,
  ) {
    this.target = args.target;

    this.isIsolated = getMetadataArgsStorage()
      .args('isolateds')
      .some(args => isMetadataArgumentFor(args, this.target));

    this.middlewares = getMetadataArgsStorage()
      .args('middlewares')
      .filter(args => isMetadataArgumentFor(args, this.target))
      .map(args => args.middleware);

    this.wrappers = getMetadataArgsStorage()
      .args('wrappers')
      .filter(args => isMetadataArgumentFor(args, this.target))
      .map(args => args.wrapper);

    this.actions = getMetadataArgsStorage()
      .args('actions')
      .filter(args => isMetadataArgumentFor({ target: args.target }, this.target))
      .map(args => new ActionMetadata(this, args));
  }

  private _instantiate() {
    // @ts-expect-error: TODO
    return new this.target();
  }

  public instantiate() {
    if (this.isSingleton) {
      if (this._instance) return this._instance;

      return (this._instance = this._instantiate());
    }

    return this._instantiate();
  }
}

export interface ControllerMetadata extends Bluish.ControllerMetadata {}

declare global {
  namespace Bluish {
    interface ControllerMetadata {}
  }
}
