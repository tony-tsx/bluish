import { HandlerMetadataArgType, HandlerMetadataArgs } from '../metadata-args/HandlerMetadataArgs.js';
import { ControllerMetadata } from './ControllerMetadata.js';
import { Middleware } from './Middleware.js';
import { Context } from './Context.js';

const factoryReducer =
  (handlerMetadata: HandlerMetadata) => (handler: (...args: any[]) => any, middleware: Middleware) =>
    middleware.onHandlerContruct?.(handler, handlerMetadata) ?? handler;

export class HandlerMetadata<TType extends HandlerMetadataArgType = HandlerMetadataArgType> {
  private _instance: any;

  public readonly args!: HandlerMetadataArgs;

  public readonly controller!: ControllerMetadata;

  public readonly middlewares!: Middleware[];

  public readonly parameters!: [number, (context: Context) => unknown][];

  public readonly isIsolated!: boolean;

  public readonly isSingleton: boolean = true;

  public readonly isStatic!: boolean;

  public readonly target!: Function;

  public readonly wrappers!: ((fn: () => unknown, context: Context) => unknown)[];

  public readonly propertyKey!: string | symbol;

  public readonly type!: TType;

  public is<TType extends HandlerMetadataArgType>(type: TType): this is HandlerMetadata<TType> {
    return (this.type as HandlerMetadataArgType) === type;
  }

  private _instantiate() {
    const controller = this.isStatic ? this.target : this.controller.instantiate();

    const reducer = factoryReducer(this);

    let self = controller[this.propertyKey].bind(controller);

    self = this.controller.app.middlewares.reduce(reducer, self);

    self = this.controller.middlewares.reduce(reducer, self);

    self = this.middlewares.reduce(reducer, self);

    return self;
  }

  public instantiate(): (...args: any[]) => any {
    if (this.isSingleton) {
      if (this._instance) return this._instance;

      return (this._instance = this._instantiate());
    }

    return this._instantiate();
  }

  public call(...args: any[]) {
    return this.instantiate()(...args);
  }
}

export interface HandlerMetadata extends Bluish.HandlerMetadata {}

declare global {
  namespace Bluish {
    interface HandlerMetadata {}
  }
}
