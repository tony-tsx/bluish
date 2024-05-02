import { MetadataArgsStorage } from '../models/MetadataArgsStorage.js';

export function getMetadataArgsStorage(): MetadataArgsStorage {
  return (global.__BLUISH_SOURCE_STORAGE__ ??= new MetadataArgsStorage());
}

declare global {
  // eslint-disable-next-line no-var
  var __BLUISH_SOURCE_STORAGE__: MetadataArgsStorage;
}
