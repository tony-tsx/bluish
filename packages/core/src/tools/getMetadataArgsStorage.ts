import { MetadataArgsStorage } from '../models/MetadataArgsStorage.js';

declare let global: any;

export function getMetadataArgsStorage(): MetadataArgsStorage {
  return (global.__BLUISH_SOURCE_STORAGE__ ??= new MetadataArgsStorage());
}
