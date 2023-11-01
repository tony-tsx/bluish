import { AfterHandlerExecuteEvent } from '../events/AfterHandlerExecuteEvent.js';
import { BeforeHandlerExecuteEvent } from '../events/BeforeHandlerExecuteEvent.js';
import { HandlerExecuteErrorEvent } from '../events/HandlerExecuteErrorEvent.js';
import { HandlerExecuteFinishEvent } from '../events/HandlerExecuteFinishEvent.js';
import { HandlerMetadata } from './HandlerMetadata.js';
import { HandlerExecuteParameterEvent } from '../events/HandlerExecuteParameterEvent.js';
import { HandlerExecuteParametersEvent } from '../events/HandlerExecuteParametersEvent.js';
import { Debugger } from '../helpers/Debugger.js';
import { Context } from './Context.js';
import { ControllerMetadata } from './ControllerMetadata.js';
import { useNextCallback } from '../tools/useNextCallback.js';
import { Middleware } from './Middleware.js';
import { App } from './App.js';

export class Runner {
  public readonly debug: Debugger;

  public readonly prop: string;

  public readonly fn: (context: Context, ...args: any[]) => unknown;

  public readonly app: App;

  public readonly controller: ControllerMetadata;

  public readonly middlewares: Middleware[];

  public readonly name: string;

  public readonly tag: string;

  constructor(public readonly handler: HandlerMetadata) {
    this.debug = Debugger.use(`core:runner:${this.handler.type}`);

    this.app = this.handler.controller.app;

    this.controller = this.handler.controller;

    this.prop =
      typeof this.handler.propertyKey === 'string'
        ? this.handler.propertyKey
        : `symbol:${this.handler.propertyKey.description}`;

    if (this.handler.isIsolated) this.middlewares = this.handler.middlewares.slice();
    else if (this.controller.isIsolated)
      this.middlewares = [...this.controller.middlewares, ...this.handler.middlewares];
    else this.middlewares = [...this.app.middlewares, ...this.controller.middlewares, ...this.handler.middlewares];

    this.name = `${this.handler.target.name}${handler.isStatic ? '::' : '.'}${this.prop}`;

    this.tag = `[${this.name}]`;

    this.middlewares.forEach(middleware => middleware.onRunnerContruct?.(this));

    this.fn = (context, ...args): unknown => this.handler.call(...args);

    this.fn = this.middlewares.reduce((fn, middleware) => {
      if (middleware.wrap) return (context, ...args) => middleware.wrap!(() => fn(context, ...args), context);

      return fn;
    }, this.fn);
  }

  public async run(...args: any[]) {
    this.debug.at(`${this.tag} Executing`);

    const context = await this.app.driver.toContext(this, ...args);

    // @ts-expect-error: TODO
    context.runner = this;

    try {
      for (const middleware of this.middlewares.reverse())
        await useNextCallback(next => middleware.onContext?.(context, next));

      {
        this.debug.at(`${this.tag} BeforeHandlerExecuteEvent emitting.`);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        using _ = this.debug.track.time(time => `${this.tag} BeforeHandlerExecuteEvent emitted in ${time}ms.`);

        const event = new BeforeHandlerExecuteEvent(context);

        for (const middleware of this.middlewares) {
          if (event.stopedPropagation) break;

          await useNextCallback(next => middleware.onBefore?.(event, next));
        }

        if (event.defaultPrevented) return this.app.driver.toReturn(event.payload, context);
      }

      let parameters: unknown[] = [];

      await Promise.all(
        this.handler.parameters.map(async ([parameterIndex, getter]) => {
          this.debug.at(`${this.tag} HandlerExecuteParameterEvent emitting.`);

          const value = await getter(context);

          const event = new HandlerExecuteParameterEvent(value, parameterIndex, context);

          for (const middleware of this.middlewares) {
            if (event.stopedPropagation) break;

            await useNextCallback(next => middleware.onParameter?.(event, next));
          }

          parameters[parameterIndex] = event.value;
        }),
      );

      {
        this.debug.at(`${this.tag} HandlerExecuteParametersEvent emitting.`);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        using _ = this.debug.track.time(time => `${this.tag} HandlerExecuteParametersEvent emitted in ${time}ms.`);

        const event = new HandlerExecuteParametersEvent(parameters, context);

        for (const middleware of this.middlewares) {
          if (event.stopedPropagation) break;

          await useNextCallback(next => middleware.onParameters?.(event, next));
        }

        parameters = event.parameters;
      }

      let payload: unknown;

      {
        this.debug.at(`${this.tag} Handler executing.`);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        using _ = this.debug.track.time(time => `${this.tag} Handler executed in ${time}ms.`);

        payload = await this.fn(context, ...parameters);
      }

      {
        this.debug.at(`${this.tag} AfterHandlerExecuteEvent emitting.`);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        using _ = this.debug.track.time(time => `${this.tag} AfterHandlerExecuteEvent emitted in ${time}ms.`);

        const event = new AfterHandlerExecuteEvent(payload, context);

        for (const middleware of this.middlewares.reverse()) {
          if (event.stopedPropagation) break;

          await useNextCallback(next => middleware.onAfter?.(event, next));
        }

        return await this.app.driver.toReturn(event.payload, context);
      }
    } catch (error) {
      {
        this.debug.at(`${this.tag} HandlerExecuteErrorEvent emitting.`);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        using _ = this.debug.track.time(time => `${this.tag} HandlerExecuteErrorEvent emitted in ${time}ms.`);

        const event = new HandlerExecuteErrorEvent(error, context);

        for (const middleware of this.middlewares.reverse()) {
          if (event.stopedPropagation) break;

          await useNextCallback(next => middleware.onError?.(event, next));
        }

        if (event.defaultPrevented) return this.app.driver.toReturn(event.payload, context);
      }

      if (this.app.driver.handleError) return this.app.driver.handleError(error, context);

      throw error;
    } finally {
      this.debug.at(`${this.tag} HandlerExecuteFinishEvent emitting.`);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      using _ = this.debug.track.time(time => `${this.tag} HandlerExecuteFinishEvent emitted in ${time}ms.`);

      const event = new HandlerExecuteFinishEvent(context);

      for (const middleware of this.middlewares.reverse()) {
        if (event.stopedPropagation) break;

        await useNextCallback(next => middleware.onFinish?.(event, next));
      }
    }
  }

  public toFunction() {
    return (...args: any[]) => this.run(...args);
  }
}
