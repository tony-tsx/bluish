import { HandlerMetadata } from './HandlerMetadata.js';
import { App } from './App.js';
import { Middleware } from './Middleware.js';
import { ControllerMetadataArgs } from '../index.js';

const factoryReducer = (controllerMetadata: ControllerMetadata) => (controller: object, middleware: Middleware) =>
  middleware.onControllerConstruct?.(controller, controllerMetadata) ?? controller;

export class ControllerMetadata {
  private _instance: any;

  public readonly app!: App;

  public readonly args!: ControllerMetadataArgs;

  public readonly isIsolated!: boolean;

  public readonly isSingleton: boolean = true;

  public readonly target!: Function;

  public readonly middlewares: Middleware[] = [];

  public readonly handlers: HandlerMetadata[] = [];

  private _instantiate() {
    // @ts-expect-error: TODO
    let self = new this.target();

    const reducer = factoryReducer(this);

    self = this.app.middlewares.reduce(reducer, self);

    self = this.middlewares.reduce(reducer, self);

    this.handlers.forEach(handler => {
      self = handler.middlewares.reduce(reducer, self);
    });

    return self;
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
