import { glob } from 'glob';

import { getMetadataArgsStorage } from '../tools/getMetadataArgsStorage.js';
import { ControllerMetadata } from './ControllerMetadata.js';
import { Middleware } from './Middleware.js';
import { Driver } from './Driver.js';
import { ControllerMetadataArgs } from '../index.js';
import { bootstrap } from '../tools/bootstrap.js';
import { isConstructor, isString, isTrusty } from '../tools/is.js';

export interface ApplicationOptions {
  driver: Driver;
  controllers: string | (new () => object) | (string | (new () => object))[];
  middlewares?: Middleware[];
}

export class Application {
  public isInitialized = false;

  public controllers!: ControllerMetadata[];

  public get driver() {
    return this.options.driver;
  }

  public middlewares: Middleware[];

  constructor(public readonly options: ApplicationOptions) {
    this.options = options;
    this.middlewares = options.middlewares ?? [];
  }

  private toController(controllerMetadataArgs: ControllerMetadataArgs) {
    const controller = new ControllerMetadata(this, controllerMetadataArgs);

    return controller;
  }

  public async toControllers(contructors: unknown[]) {
    return await Promise.all(
      contructors
        .filter(isConstructor)
        .map(constructor =>
          getMetadataArgsStorage()
            .args('controllers')
            .find(args => constructor === args.target),
        )
        .filter(isTrusty)
        .map(constructor => this.toController(constructor)),
    );
  }

  public async bootstrap() {
    if (this.isInitialized) throw new Error('TODO');

    try {
      this.isInitialized = true;

      this.driver.app = this;

      await this.driver.bootstrap?.();

      for (const middleware of this.middlewares) await bootstrap(middleware, async () => middleware.onBootstrap?.());

      const globPatternsOrConstructors = Array.isArray(this.options.controllers)
        ? this.options.controllers
        : [this.options.controllers];

      const constructors = globPatternsOrConstructors.filter(isConstructor);

      const globPatterns = globPatternsOrConstructors.filter(isString);

      const filepaths = await glob(globPatterns);

      const controllers = await Promise.all([
        this.toControllers(constructors),
        ...filepaths.map(async filepath => {
          const module = await import(filepath);

          return await this.toControllers(Object.values(module));
        }),
      ]);

      this.controllers = controllers.flat();

      await Promise.all(
        this.controllers.map(async controller => {
          for (const middleware of controller.middlewares)
            await bootstrap(middleware, async () => middleware.onBootstrap?.());

          for (const middleware of this.middlewares) await middleware.onController?.(controller);

          for (const middleware of controller.middlewares) await middleware.onController?.(controller);

          await Promise.all(
            controller.actions.map(async action => {
              for (const middleware of action.middlewares)
                await bootstrap(middleware, async () => middleware.onBootstrap?.());

              for (const middleware of action.middlewares) await middleware.onController?.(controller);

              for (const middleware of action.middlewares) await middleware.onAction?.(action);

              for (const middleware of controller.middlewares) await middleware.onAction?.(action);

              for (const middleware of this.middlewares) await middleware.onAction?.(action);

              await this.driver.onAction?.(action);

              for (const middleware of action.middlewares) await middleware.onApplication?.(this);
            }),
          );

          await this.driver.onController?.(controller);

          for (const middleware of controller.middlewares) await middleware.onApplication?.(this);
        }),
      );

      for (const middleware of this.middlewares) await middleware.onApplication?.(this);
    } catch (error) {
      this.isInitialized = false;

      throw error;
    }
  }
}

export interface Application extends Bluish.Application {}

declare global {
  namespace Bluish {
    interface Application {}
  }
}
