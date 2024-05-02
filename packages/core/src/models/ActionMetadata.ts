import { ActionMetadataArgType, ActionMetadataArgs } from '../metadata-args/ActionMetadataArgs.js';
import { ControllerMetadata } from './ControllerMetadata.js';
import { Middleware } from './Middleware.js';
import { Context } from './Context.js';
import { getMetadataArgsStorage } from '../tools/getMetadataArgsStorage.js';
import { isMetadataArgumentWithPropertyKeyFor } from '../tools/is.js';
import { Runner } from './Runner.js';

export class ActionMetadata<TType extends ActionMetadataArgType = ActionMetadataArgType> {
  public readonly middlewares: Middleware[];

  public readonly arguments: [number, (context: Context) => unknown][];

  public readonly target: Function | object;

  public readonly wrappers: ((fn: () => unknown, context: Context) => unknown)[];

  public readonly propertyKey: string | symbol;

  public readonly type: TType;

  public readonly isIsolated: boolean;

  public readonly isStatic: boolean;

  constructor(
    public readonly controller: ControllerMetadata,
    public readonly args: ActionMetadataArgs<TType>,
  ) {
    this.target = args.target;

    this.propertyKey = args.propertyKey;

    this.type = args.type;

    this.isStatic = typeof this.target === 'function';

    this.isIsolated = getMetadataArgsStorage()
      .args('isolateds')
      .some(args => isMetadataArgumentWithPropertyKeyFor(args, this));

    this.middlewares = getMetadataArgsStorage()
      .args('middlewares')
      .filter(args => isMetadataArgumentWithPropertyKeyFor(args, this))
      .map(args => args.middleware);

    this.arguments = getMetadataArgsStorage()
      .args('arguments')
      .filter(args => isMetadataArgumentWithPropertyKeyFor(args, this))
      .map(args => [args.parameterIndex, args.getter]);

    this.wrappers = getMetadataArgsStorage()
      .args('wrappers')
      .filter(args => isMetadataArgumentWithPropertyKeyFor(args, this))
      .map(args => args.wrapper);
  }

  public is<TType extends ActionMetadataArgType>(type: TType): this is ActionMetadata<TType> {
    return (this.type as ActionMetadataArgType) === type;
  }

  private _instantiate() {
    if (typeof this.target === 'function') return (this.target as any)[this.propertyKey].bind(this.target);

    const controller = this.controller.instantiate();

    return controller[this.propertyKey].bind(controller);
  }

  public instantiate(): (...args: any[]) => any {
    return this._instantiate();
  }

  public call(...args: any[]) {
    return this.instantiate()(...args);
  }

  public toRunner() {
    return new Runner(this);
  }

  public toFunction() {
    return this.toRunner().toFunction();
  }
}

export interface ActionMetadata extends Bluish.ActionMetadata {}

declare global {
  namespace Bluish {
    interface ActionMetadata {}
  }
}
