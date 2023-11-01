import { MetadataArgs } from './MetadataArgs.js';
import { ControllerMetadata } from '../models/ControllerMetadata.js';

export interface ParseControllerMetadataArgs extends MetadataArgs {
  parse(controllerMetadata: ControllerMetadata): void | Promise<void>;
}
