import { Middleware } from '../models/Middleware.js';

export interface MiddlewareMetadataArgs {
  target: Function | object;
  propertyKey?: string | symbol;
  middleware: Middleware;
}
