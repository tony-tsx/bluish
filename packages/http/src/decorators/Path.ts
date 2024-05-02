import { ActionMetadata, Middleware, Use } from '@bluish/core';

export function Path(path: string | string[]): (target: Function | Object, propertyKey?: string | symbol) => void;
export function Path(path: string | string[], controller: new () => object): (target: Function) => void;
export function Path(path: string | string[]) {
  const paths = Array.isArray(path) ? path : path.startsWith('/') ? path.split('/').slice(1) : path.split('/');

  return (target: Function | Object, propertyKey?: string | symbol) => {
    if (propertyKey)
      Use(
        Middleware.onAction(action => {
          Object.defineProperty(action, '@http:path', {
            get(this: ActionMetadata) {
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
    else Use(Middleware.onController(controller => void (controller['@http:paths'] = paths)))(target);
  };
}

declare global {
  namespace Bluish {
    interface ActionMetadata {
      readonly '@http:path'?: string;
    }

    interface ControllerMetadata {
      '@http:paths'?: string[];
    }
  }
}
