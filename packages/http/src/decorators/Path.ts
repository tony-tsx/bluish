import { Middleware, Use, HandlerMetadata } from '@bluish/core';

export function Path(path: string | string[]): (target: Function | Object, propertyKey?: string | symbol) => void;
export function Path(path: string | string[], controller: new () => object): (target: Function) => void;
export function Path(path: string | string[]) {
  const paths = Array.isArray(path) ? path : path.startsWith('/') ? path.split('/').slice(1) : path.split('/');

  return (target: Function | Object, propertyKey?: string | symbol) => {
    if (propertyKey)
      Use(
        Middleware.onHandler(metadata => {
          Object.defineProperty(metadata, '@http:path', {
            get(this: HandlerMetadata) {
              this.controller['@http:paths'] ??= [];

              const value = ['', ...this.controller['@http:paths'], ...paths!].join('/');

              Object.defineProperty(this, '@http:path', { value });

              return value;
            },
            configurable: true,
            enumerable: true,
          });
        }),
      )(target, propertyKey);
    else
      Use(
        Middleware.onController(controller => {
          controller['@http:paths'] = paths;
        }),
      )(target, propertyKey);
  };
}

declare global {
  namespace Bluish {
    interface HandlerMetadata {
      readonly '@http:path'?: string;
    }

    interface ControllerMetadata {
      '@http:paths'?: string[];
    }
  }
}
