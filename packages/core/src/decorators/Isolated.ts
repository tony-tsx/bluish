import { getMetadataArgsStorage } from '../tools/getMetadataArgsStorage.js';

export function Isolated() {
  return (target: Function | Object, propertyKey?: string | symbol) => {
    getMetadataArgsStorage().args('isolateds', {
      target,
      propertyKey,
    });
  };
}
