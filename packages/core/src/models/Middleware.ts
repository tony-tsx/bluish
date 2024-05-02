import { ActionThenEvent } from '../events/ActionThenEvent.js';
import { ActionInitializeEvent } from '../events/ActionInitializeEvent.js';
import { ActionErrorEvent } from '../events/ActionErrorEvent.js';
import { ActionFinallyEvent } from '../events/ActionFinallyEvent.js';
import { ActionArgumentEvent } from '../events/ActionArgumentEvent.js';
import { ActionArgumentsEvent } from '../events/ActionArgumentsEvent.js';
import { ActionMetadata } from './ActionMetadata.js';
import { ControllerMetadata } from './ControllerMetadata.js';
import { Runner } from './Runner.js';
import { Context } from './Context.js';
import { Application } from './Application.js';

export class Middleware {
  public static from(middleware: Partial<Middleware>, name?: string): Middleware {
    class AnonymousMiddleware extends Middleware {}

    if (name)
      Object.defineProperty(AnonymousMiddleware, 'name', {
        value: `${name[0].toUpperCase()}${name.slice(1)}Middleware`,
      });

    const instance = new AnonymousMiddleware();

    return Object.assign(instance, middleware);
  }

  public static onBootstrap(onBootstrap: NonNullable<Middleware['onBootstrap']>): Middleware {
    return this.from({ onBootstrap }, onBootstrap.name);
  }

  public static onInitialize(onInitialize: NonNullable<Middleware['onInitialize']>): Middleware {
    return this.from({ onInitialize }, onInitialize.name);
  }

  public static onThen(onThen: NonNullable<Middleware['onThen']>): Middleware {
    return this.from({ onThen }, onThen.name);
  }

  public static onCatch(onCatch: NonNullable<Middleware['onCatch']>): Middleware {
    return this.from({ onCatch }, onCatch.name);
  }

  public static onFinally(onFinally: NonNullable<Middleware['onFinally']>): Middleware {
    return this.from({ onFinally }, onFinally.name);
  }

  public static onArgument(onArgument: NonNullable<Middleware['onArgument']>): Middleware {
    return this.from({ onArgument }, onArgument.name);
  }

  public static onArguments(onArguments: NonNullable<Middleware['onArguments']>): Middleware {
    return this.from({ onArguments }, onArguments.name);
  }

  public static onContext(onContext: NonNullable<Middleware['onContext']>): Middleware {
    return this.from({ onContext }, onContext.name);
  }

  public static onAction(onHandler: NonNullable<Middleware['onAction']>): Middleware {
    return this.from({ onAction: onHandler }, onHandler.name);
  }

  public static onController(onController: NonNullable<Middleware['onController']>): Middleware {
    return this.from({ onController }, onController.name);
  }

  public static onRunnerContruct(onRunnerContruct: NonNullable<Middleware['onRunner']>): Middleware {
    return this.from({ onRunner: onRunnerContruct }, onRunnerContruct.name);
  }

  public static wrap(wrap: NonNullable<Middleware['wrap']>): Middleware {
    return this.from({ wrap }, wrap.name);
  }

  public async bootstrap(): Promise<void> {
    await this.onBootstrap?.();
  }

  public onBootstrap?(): void | Promise<void>;
  public onInitialize?(event: ActionInitializeEvent, next: () => void): void | Promise<void>;
  public onThen?(event: ActionThenEvent, next: () => void): void | Promise<void>;
  public onCatch?(event: ActionErrorEvent, next: () => void): void | Promise<void>;
  public onFinally?(event: ActionFinallyEvent, next: () => void): void | Promise<void>;
  public onArgument?(event: ActionArgumentEvent, next: () => void): void | Promise<void>;
  public onArguments?(event: ActionArgumentsEvent, next: () => void): void | Promise<void>;
  public onContext?(context: Context, next: () => void): void | Promise<void>;

  /**
   * System
   */
  public onApplication?(application: Application): void | Promise<void>;

  public onController?(controllerMetadata: ControllerMetadata): void | Promise<void>;

  public onAction?(action: ActionMetadata): void | Promise<void>;

  public onRunner?(runner: Runner): void;

  public wrap?(fn: () => unknown, context: Context): unknown;
}

export interface Middleware extends Bluish.Middleware {}

declare global {
  namespace Bluish {
    interface Middleware {}
  }
}
