import { MetadataArgs } from '../metadata-args/MetadataArgs.js';

export function isForMetadataArgs(contructor: Function, metadataArgs: MetadataArgs) {
  return contructor === metadataArgs.target || contructor.prototype instanceof metadataArgs.target;
}
