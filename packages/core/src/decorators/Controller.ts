import { getMetadataArgsStorage } from '../tools/getMetadataArgsStorage.js';

export function Controller(target: Function) {
  getMetadataArgsStorage().args('controllers', { target });
}
