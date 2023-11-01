import { MetadataArgs } from './MetadataArgs.js';

export interface IsolatedMetadataArgs extends MetadataArgs {
  propertyKey?: string | symbol;
}
