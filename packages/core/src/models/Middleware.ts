import { AfterHandlerExecuteEvent } from '../events/AfterHandlerExecuteEvent.js';
import { BeforeHandlerExecuteEvent } from '../events/BeforeHandlerExecuteEvent.js';
import { HandlerExecuteErrorEvent } from '../events/HandlerExecuteErrorEvent.js';
import { HandlerExecuteFinishEvent } from '../events/HandlerExecuteFinishEvent.js';
import { HandlerExecuteParameterEvent } from '../events/HandlerExecuteParameterEvent.js';
import { HandlerExecuteParametersEvent } from '../events/HandlerExecuteParametersEvent.js';
import { Debugger } from '../helpers/Debugger.js';
import { HandlerMetadata } from './HandlerMetadata.js';
import { ControllerMetadata } from './ControllerMetadata.js';
import { Runner } from './Runner.js';
import { Context } from './Context.js';

export class Middleware {
  private _debugger = Debugger.use('core:middleware');

  public static from(middleware: Partial<Middleware>, name?: string): Middleware {
    class AnonymousMiddleware extends Middleware {}

    if (name)
      Object.defineProperty(AnonymousMiddleware, 'name', {
        value: `${name[0].toUpperCase()}${name.slice(1)}Middleware`,
      });

    const instance = new AnonymousMiddleware();

    return Object.assign(instance, middleware);
  }

  public static onInitialize(onInitialize: NonNullable<Middleware['onInitialize']>): Middleware {
    return this.from({ onInitialize }, onInitialize.name);
  }

  public static onBefore(onBefore: NonNullable<Middleware['onBefore']>): Middleware {
    return this.from({ onBefore }, onBefore.name);
  }

  public static onAfter(onAfter: NonNullable<Middleware['onAfter']>): Middleware {
    return this.from({ onAfter }, onAfter.name);
  }

  public static onError(onError: NonNullable<Middleware['onError']>): Middleware {
    return this.from({ onError }, onError.name);
  }

  public static onFinish(onFinish: NonNullable<Middleware['onFinish']>): Middleware {
    return this.from({ onFinish }, onFinish.name);
  }

  public static onParameter(onParameter: NonNullable<Middleware['onParameter']>): Middleware {
    return this.from({ onParameter }, onParameter.name);
  }

  public static onParameters(onParameters: NonNullable<Middleware['onParameters']>): Middleware {
    return this.from({ onParameters }, onParameters.name);
  }

  public static onContext(onContext: NonNullable<Middleware['onContext']>): Middleware {
    return this.from({ onContext }, onContext.name);
  }

  public static onHandler(onHandler: NonNullable<Middleware['onHandler']>): Middleware {
    return this.from({ onHandler }, onHandler.name);
  }

  public static onController(onController: NonNullable<Middleware['onController']>): Middleware {
    return this.from({ onController }, onController.name);
  }

  public static onControllerConstruct(
    onControllerConstruct: NonNullable<Middleware['onControllerConstruct']>,
  ): Middleware {
    return this.from({ onControllerConstruct }, onControllerConstruct.name);
  }

  public static onRunnerContruct(onRunnerContruct: NonNullable<Middleware['onRunnerContruct']>): Middleware {
    return this.from({ onRunnerContruct }, onRunnerContruct.name);
  }

  public static onHandlerContruct(onHandlerContruct: NonNullable<Middleware['onHandlerContruct']>): Middleware {
    return this.from({ onHandlerContruct }, onHandlerContruct.name);
  }

  public static wrap(wrap: NonNullable<Middleware['wrap']>): Middleware {
    return this.from({ wrap }, wrap.name);
  }

  public async initialize(): Promise<void> {
    await this.onInitialize?.();
  }

  public onInitialize?(): void | Promise<void>;
  public onBefore?(event: BeforeHandlerExecuteEvent, next: () => void): void | Promise<void>;
  public onAfter?(event: AfterHandlerExecuteEvent, next: () => void): void | Promise<void>;
  public onError?(event: HandlerExecuteErrorEvent, next: () => void): void | Promise<void>;
  public onFinish?(event: HandlerExecuteFinishEvent, next: () => void): void | Promise<void>;
  public onParameter?(event: HandlerExecuteParameterEvent, next: () => void): void | Promise<void>;
  public onParameters?(event: HandlerExecuteParametersEvent, next: () => void): void | Promise<void>;
  public onContext?(context: Context, next: () => void): void | Promise<void>;

  /**
   * System
   */
  public onHandler?(handlerMetadata: HandlerMetadata): void | Promise<void>;

  public onController?(controllerMetadata: ControllerMetadata): void | Promise<void>;

  public onControllerConstruct?(controller: object, controllerMetadata: ControllerMetadata): void;

  public onRunnerContruct?(runner: Runner): void;

  public onHandlerContruct?(
    fn: (...args: any[]) => any,
    handlerMetadata: HandlerMetadata,
  ): void | undefined | null | ((...args: any[]) => any);

  public wrap?(fn: () => unknown, context: Context): unknown;
}

export interface Middleware extends Bluish.Middleware {}

declare global {
  namespace Bluish {
    interface Middleware {}
  }
}
