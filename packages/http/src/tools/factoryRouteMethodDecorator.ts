import { HttpMethod, Route } from '../decorators/Route.js';

export interface RouteMethodDecorator {
  (target: object, propertyKey: string | symbol): void;
  (path: string): (target: object, propertyKey: string | symbol) => void;
}

export function factoryRouteMethodDecorator(
  httpMethod: HttpMethod | [HttpMethod, ...HttpMethod[]],
): RouteMethodDecorator {
  return ((targetOrPath: object | string, propertyKey?: string | symbol) => {
    if (typeof targetOrPath === 'string') return Route(httpMethod, targetOrPath);

    return Route(httpMethod)(targetOrPath, propertyKey!);
  }) as RouteMethodDecorator;
}
