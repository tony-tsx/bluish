import { Middleware } from '../models/Middleware.js';
import { getMetadataArgsStorage } from '../tools/getMetadataArgsStorage.js';

export function Use(middleware: Middleware) {
  return (target: Object | Function, propertyKey?: string | symbol) => {
    getMetadataArgsStorage().args('middlewares', {
      target,
      propertyKey,
      middleware,
    });
  };
}

export function OnBootstrap(onBootstrap: NonNullable<Middleware['onBootstrap']>) {
  return Use(Middleware.onBootstrap(onBootstrap));
}

export function OnInitialize(onInitialize: NonNullable<Middleware['onInitialize']>) {
  return Use(Middleware.onInitialize(onInitialize));
}

export function OnThen(onThen: NonNullable<Middleware['onThen']>) {
  return Use(Middleware.onThen(onThen));
}

export function OnCatch(onCatch: NonNullable<Middleware['onCatch']>) {
  return Use(Middleware.onCatch(onCatch));
}

export function OnFinally(onFinally: NonNullable<Middleware['onFinally']>) {
  return Use(Middleware.onFinally(onFinally));
}
