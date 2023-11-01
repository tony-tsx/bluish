import { glob } from 'glob';

import { isString } from '../tools/isString.js';
import { isConstructor } from '../tools/isConstructor.js';
import { getMetadataArgsStorage } from '../tools/getMetadataArgsStorage.js';
import { ControllerMetadata } from './ControllerMetadata.js';
import { HandlerMetadata } from './HandlerMetadata.js';
import { Middleware } from './Middleware.js';
import { Driver } from './Driver.js';
import { isForMetadataArgs } from '../tools/isForMetadataArgs.js';
import { Debugger } from '../helpers/Debugger.js';
import { ControllerMetadataArgs } from '../index.js';
import { isTrusty } from '../tools/isTrusty.js';
import { init } from '../tools/init.js';

export interface AppOptions {
  driver: Driver;
  functions: string | (new () => object) | (string | (new () => object))[];
  middlewares?: Middleware[];
}

export class App {
  #debug = Debugger.use('core:app');

  public isInitialized = false;

  public controllers!: ControllerMetadata[];

  public get driver() {
    return this.options.driver;
  }

  public middlewares: Middleware[];

  constructor(public readonly options: AppOptions) {
    this.options = options;
    this.middlewares = options.middlewares ?? [];
  }

  private _middlewares = new Set<Middleware>();

  private async _initializeMiddleware(middleware: Middleware) {
    if (this._middlewares.has(middleware)) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    using _ = this.#debug.track.time(time => `${middleware.constructor.name} Middleware initialized in ${time}ms.`);

    this._middlewares.add(middleware);

    try {
      await middleware.initialize();
    } catch {
      this._middlewares.delete(middleware);
    }
  }

  private async _initializeController(controllerMetadataArgs: ControllerMetadataArgs) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    using _ = this.#debug.track.time(
      time => `${controllerMetadataArgs.target.name} Controller initialized in ${time}ms.`,
    );

    const metadataArgsStorage = getMetadataArgsStorage();

    const controller = new ControllerMetadata();

    // @ts-expect-error: TODO
    controller.app = this;

    // @ts-expect-error: TODO
    controller.args = controllerMetadataArgs;

    // @ts-expect-error: TODO
    controller.target = controllerMetadataArgs.target;

    // @ts-expect-error: TODO
    controller.isIsolated = metadataArgsStorage
      .args('isolateds')
      .some(args => isForMetadataArgs(controllerMetadataArgs.target, args) && !args.propertyKey);

    const targetMiddlewares = metadataArgsStorage
      .args('middlewares')
      .filter(args => isForMetadataArgs(controllerMetadataArgs.target, args))
      .reverse();

    // @ts-expect-error: TODO
    controller.middlewares = targetMiddlewares.filter(args => !args.propertyKey).map(args => args.instance);

    for (const middleware of controller.middlewares) await init(middleware, async () => middleware.onInitialize?.());

    // @ts-expect-error: TODO
    controller.handlers = await Promise.all(
      metadataArgsStorage
        .args('handlers')
        .filter(args => isForMetadataArgs(controllerMetadataArgs.target, args))
        .map(async args => {
          const handler = new HandlerMetadata();

          // @ts-expect-error: TODO
          handler.target = controllerMetadataArgs.target;

          // @ts-expect-error: TODO
          handler.controller = controller;

          // @ts-expect-error: TODO
          handler.args = args;

          // @ts-expect-error: TODO
          handler.propertyKey = args.propertyKey;

          // @ts-expect-error: TODO
          handler.type = args.type;

          // @ts-expect-error: TODO
          handler.isStatic = args.isStatic;

          // @ts-expect-error: TODO
          handler.isIsolated = metadataArgsStorage
            .args('isolateds')
            .some(
              args =>
                isForMetadataArgs(controllerMetadataArgs.target, args) && handler.propertyKey === args.propertyKey,
            );

          // @ts-expect-error: TODO
          handler.middlewares = targetMiddlewares
            .filter(args => handler.propertyKey === args.propertyKey)
            .map(args => args.instance);

          // @ts-expect-error: TODO
          handler.parameters = metadataArgsStorage
            .args('parameters')
            .filter(
              args =>
                isForMetadataArgs(controllerMetadataArgs.target, args) &&
                handler.propertyKey === args.propertyKey &&
                handler.isStatic === args.isStatic,
            )
            .map(args => [args.parameterIndex, args.getter]);

          // @ts-expect-error: TODO
          handler.wrappers = metadataArgsStorage
            .args('wrappers')
            .filter(
              args =>
                isForMetadataArgs(controllerMetadataArgs.target, args) &&
                (!args.propertyKey || args.propertyKey === handler.propertyKey),
            )
            .map(args => args.wrapper);

          for (const middleware of handler.middlewares) await init(middleware, async () => middleware.onInitialize?.());

          for (const middleware of handler.middlewares) await middleware.onHandler?.(handler);

          for (const middleware of controller.middlewares) await middleware.onHandler?.(handler);

          for (const middleware of this.middlewares) await middleware.onHandler?.(handler);

          for (const middleware of handler.middlewares) await middleware.onController?.(controller);

          return handler;
        }),
    );

    for (const middleware of controller.middlewares) await middleware.onController?.(controller);

    for (const middleware of this.middlewares) await middleware.onController?.(controller);

    for (const handler of controller.handlers) await this.driver.onHandler?.(handler);

    return controller;
  }

  public async initialize() {
    if (this.isInitialized) throw new Error('TODO');

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      using _ = this.#debug.track.time(time => `Application initialized in ${time}ms.`);

      this.isInitialized = true;

      this.driver.app = this;

      {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        using _ = this.#debug.track.time(time => `Driver initialized in ${time}ms.`);

        await this.driver.initialize?.();
      }

      for (const middleware of this.middlewares) await init(middleware, async () => middleware.onInitialize?.());

      const globPatternsOrConstructors = Array.isArray(this.options.functions)
        ? this.options.functions
        : [this.options.functions];

      const constructors = globPatternsOrConstructors.filter(isConstructor);

      const globPatterns = globPatternsOrConstructors.filter(isString);

      {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        using _ = this.#debug.track.time(time => `Controllers initialized in ${time}ms.`);

        const filepaths = await glob(globPatterns);

        const metadataArgsStorage = getMetadataArgsStorage();

        const controllerMetadatas = await Promise.all([
          ...constructors
            .map(constructor => metadataArgsStorage.args('controllers').find(args => constructor === args.target))
            .filter(isTrusty)
            .map(this._initializeController, this),
          ...filepaths.map(async filepath => {
            const module = await import(filepath);

            const controllers = Object.values(module)
              .filter(isConstructor)
              .map(constructor => metadataArgsStorage.args('controllers').find(args => constructor === args.target))
              .filter(isTrusty);

            return await Promise.all(controllers.map(async controller => this._initializeController(controller!)));
          }),
        ]);

        this.controllers = controllerMetadatas.flat();
      }
    } catch (error) {
      this.isInitialized = false;

      throw error;
    }
  }
}
