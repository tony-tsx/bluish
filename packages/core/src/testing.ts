import { Context } from './models/Context.js';
import { Runner } from './models/Runner.js';
import { Application } from './models/Application.js';
import { Driver } from './models/Driver.js';
import { bootstrap } from './tools/bootstrap.js';

let defaultTestingApp: Application | undefined = undefined;

export function beforeEach() {
  bootstrap.storage.clear();
}

export interface TestingSetupOptions {
  app?: Application;
}

export function setup({ app }: TestingSetupOptions) {
  defaultTestingApp = app;
}

export class TestingDriver extends Driver {
  public toContext(runner: Runner, ...args: any[]): Context | Promise<Context> {
    return args[0];
  }

  public toReturn(payload: unknown) {
    return payload;
  }
}

export async function execute<T extends object, K extends keyof T>(
  app: Application,
  controller: new () => T,
  propertyKey: K,
  context: Context,
): Promise<any>;
export async function execute<T extends object, K extends keyof T>(
  controller: new () => T,
  propertyKey: K,
  context: Context,
): Promise<any>;
export async function execute<T extends object, K extends keyof T>(
  appOrController: Application | (new () => T),
  controllerOrMethod: (new () => T) | K,
  propertyKeyOrContext: K | Context,
  maybeContext?: Context,
): Promise<any> {
  let app: Application | undefined;
  let controller: new () => T;
  let propertyKey: K;
  let context: Context;

  if (appOrController instanceof Application) {
    app = appOrController;
    controller = controllerOrMethod as new () => T;
    propertyKey = propertyKeyOrContext as K;
    context = maybeContext!;
  } else {
    app = defaultTestingApp;
    controller = appOrController as new () => T;
    propertyKey = controllerOrMethod as K;
    context = propertyKeyOrContext as Context;
  }

  if (app)
    app = new Application({
      ...app.options,
      controllers: [controller],
      driver: new TestingDriver(),
    });
  else
    app = new Application({
      controllers: [controller],
      driver: new TestingDriver(),
    });

  await app.bootstrap();

  const handler = app.controllers
    .find(_controller => _controller.target === controller)!
    .actions.find(handler => handler.propertyKey === propertyKey)!;

  const runner = new Runner(handler);

  return runner.run(context);
}
