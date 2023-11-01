import { Middleware } from '../models/Middleware.js';
import { MetadataArgs } from './MetadataArgs.js';

export interface MiddlewareMetadataArgs extends MetadataArgs {
  propertyKey?: string | symbol;

  instance: Middleware;
}
