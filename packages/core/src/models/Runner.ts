import { ActionThenEvent } from '../events/ActionThenEvent.js';
import { ActionInitializeEvent } from '../events/ActionInitializeEvent.js';
import { ActionErrorEvent } from '../events/ActionErrorEvent.js';
import { ActionFinallyEvent } from '../events/ActionFinallyEvent.js';
import { ActionMetadata } from './ActionMetadata.js';
import { ActionArgumentEvent } from '../events/ActionArgumentEvent.js';
import { ActionArgumentsEvent } from '../events/ActionArgumentsEvent.js';
import { Context } from './Context.js';
import { ControllerMetadata } from './ControllerMetadata.js';
import { useNextCallback } from '../tools/useNextCallback.js';
import { Middleware } from './Middleware.js';
import { Application } from './Application.js';
import { ActionMetadataArgType } from '../metadata-args/ActionMetadataArgs.js';

export class Runner<TType extends ActionMetadataArgType = ActionMetadataArgType> {
  public readonly prop: string;

  public readonly call: (context: Context, ...args: any[]) => unknown;

  public readonly application: Application;

  public readonly controller: ControllerMetadata;

  public readonly middlewares: Middleware[];

  public readonly name: string;

  public readonly tag: string;

  constructor(public readonly action: ActionMetadata<TType>) {
    this.application = this.action.controller.app;

    this.controller = this.action.controller;

    this.prop =
      typeof this.action.propertyKey === 'string'
        ? this.action.propertyKey
        : `symbol:${this.action.propertyKey.description}`;

    if (this.action.isIsolated) this.middlewares = this.action.middlewares.slice();
    else if (this.controller.isIsolated)
      this.middlewares = [...this.controller.middlewares, ...this.action.middlewares];
    else
      this.middlewares = [...this.application.middlewares, ...this.controller.middlewares, ...this.action.middlewares];

    this.name = `${this.action.controller.target.name}${typeof this.action.target === 'function' ? '::' : '.'}${this.prop}`;

    this.tag = `[${this.name}]`;

    this.middlewares.forEach(middleware => middleware.onRunner?.(this));

    this.call = (context, ...args): unknown => this.action.call(...args);

    this.call = this.middlewares.reduce((act, middleware) => {
      if (middleware.wrap) return (context, ...args) => middleware.wrap!(() => act(context, ...args), context);

      return act;
    }, this.call);
  }

  protected async onContext(context: Context) {
    await useNextCallback(next => this.application.driver.onContext?.(context, next));

    for (const middleware of this.middlewares) {
      if (context.stopedPropagation) break;

      await useNextCallback(next => middleware.onContext?.(context, next));
    }

    return context;
  }

  protected async onInitialize(event: ActionInitializeEvent) {
    await useNextCallback(next => this.application.driver.onInitialize?.(event, next));

    for (const middleware of this.middlewares) {
      if (event.stopedPropagation) break;

      await useNextCallback(next => middleware.onInitialize?.(event, next));
    }

    return event;
  }

  protected async onThen(event: ActionThenEvent) {
    for (const middleware of this.middlewares.reverse()) {
      if (event.stopedPropagation) break;

      await useNextCallback(next => middleware.onThen?.(event, next));
    }

    if (!event.stopedPropagation) await useNextCallback(next => this.application.driver.onThen?.(event, next));

    return event;
  }

  protected async onArgument(event: ActionArgumentEvent) {
    await useNextCallback(next => this.application.driver.onArgument?.(event, next));

    for (const middleware of this.middlewares) {
      if (event.stopedPropagation) break;

      await useNextCallback(next => middleware.onArgument?.(event, next));
    }

    return event;
  }

  protected async onArguments(actionArgumentsEvent: ActionArgumentsEvent) {
    await useNextCallback(next => this.application.driver.onArguments?.(actionArgumentsEvent, next));

    for (const middleware of this.middlewares) {
      if (actionArgumentsEvent.stopedPropagation) break;

      await useNextCallback(next => middleware.onArguments?.(actionArgumentsEvent, next));
    }

    return actionArgumentsEvent;
  }

  protected async onCatch(event: ActionErrorEvent) {
    for (const middleware of this.middlewares.reverse()) {
      if (event.stopedPropagation) break;

      await useNextCallback(next => middleware.onCatch?.(event, next));
    }

    if (!event.stopedPropagation) await useNextCallback(next => this.application.driver.onCatch?.(event, next));

    return event;
  }

  protected async onFinally(event: ActionFinallyEvent) {
    for (const middleware of this.middlewares.reverse()) {
      if (event.stopedPropagation) break;

      await useNextCallback(next => middleware.onFinally?.(event, next));
    }

    if (!event.stopedPropagation) await useNextCallback(next => this.application.driver.onFinally?.(event, next));

    return event;
  }

  public async run(...args: any[]) {
    const context = await this.application.driver.toContext(this, ...args);

    Object.assign(context, { runner: this });

    await context.initialize();

    try {
      await this.onContext(context);

      {
        const event = await this.onInitialize(new ActionInitializeEvent(context));
        if (event.defaultPrevented) return this.application.driver.toReturn(event.payload, context);
      }

      let args: unknown[] = [];

      await Promise.all(
        this.action.arguments.map(async ([parameterIndex, getter]) => {
          const event = await this.onArgument(new ActionArgumentEvent(await getter(context), parameterIndex, context));
          args[parameterIndex] = event.value;
        }),
      );

      {
        const event = await this.onArguments(new ActionArgumentsEvent(args, context));
        args = event.args;
      }

      const payload = await this.call(context, ...args);

      {
        const event = await this.onThen(new ActionThenEvent(payload, context));
        return await this.application.driver.toReturn(event.payload, context);
      }
    } catch (error) {
      const event = await this.onCatch(new ActionErrorEvent(error, context));

      if (event.defaultPrevented) return this.application.driver.toReturn(event.payload, context);

      throw error;
    } finally {
      await this.onFinally(new ActionFinallyEvent(context));
    }
  }

  public toFunction() {
    return (...args: any[]) => this.run(...args);
  }
}
