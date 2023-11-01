import { Context } from './models/Context.js';
import { Runner } from './models/Runner.js';
import { App } from './models/App.js';
import { Driver } from './models/Driver.js';
import { init } from './tools/init.js';

let defaultTestingApp: App | undefined = undefined;

export function beforeEach() {
  init.storage.clear();
}

export interface TestingSetupOptions {
  app?: App;
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
  app: App,
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
  appOrController: App | (new () => T),
  controllerOrMethod: (new () => T) | K,
  propertyKeyOrContext: K | Context,
  maybeContext?: Context,
): Promise<any> {
  let app: App | undefined;
  let controller: new () => T;
  let propertyKey: K;
  let context: Context;

  if (appOrController instanceof App) {
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
    app = new App({
      ...app.options,
      controllers: [controller],
      driver: new TestingDriver(),
    });
  else
    app = new App({
      controllers: [controller],
      driver: new TestingDriver(),
    });

  await app.initialize();

  const handler = app.controllers
    .find(_controller => _controller.target === controller)!
    .handlers.find(handler => handler.propertyKey === propertyKey)!;

  const runner = new Runner(handler);

  return runner.run(context);
}
