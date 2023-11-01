import { Context } from '../index.js';
import { MetadataArgs } from './MetadataArgs.js';

export interface WrapperMetadataArgs extends MetadataArgs {
  propertyKey?: string | symbol;
  wrapper: (fn: () => unknown, context: Context) => unknown;
}
