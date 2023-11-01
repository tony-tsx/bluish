import { App } from '../models/App.js';

export const ON_APP_LISTENERS = Symbol();

export function onApp(fn: (app: App) => void | Promise<void>) {
  onApp[ON_APP_LISTENERS].push(fn);
}

onApp[ON_APP_LISTENERS] = [] as ((app: App) => void | Promise<void>)[];

Object.defineProperty(onApp, ON_APP_LISTENERS, {
  writable: false,
  enumerable: false,
  configurable: false,
});
