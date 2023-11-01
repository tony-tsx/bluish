import { MetadataArgs } from './MetadataArgs.js';
import { HandlerMetadata } from '../models/HandlerMetadata.js';
import { HandlerMetadataArgs } from '../metadata-args/HandlerMetadataArgs.js';

export interface ParseHandlerMetadataArgs extends MetadataArgs {
  parse(handlerMetadata: HandlerMetadata, handlerMetadataArgs: HandlerMetadataArgs): void | Promise<void>;
}
